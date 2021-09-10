package main

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"sync"

	"github.com/mrhenry/web-tests/scripts/browserua"
	"github.com/mrhenry/web-tests/scripts/priority"
	"github.com/mrhenry/web-tests/scripts/store"
	"golang.org/x/sync/semaphore"
)

func main() {
	db, err := store.NewSqliteDatabase("./web-tests.db", false)
	if err != nil {
		panic(err)
	}

	uas, err := store.SelectAllUserAgents(context.Background(), db)
	if err != nil {
		panic(err)
	}

	mapping, err := store.SelectAllFeatures(context.Background(), db)
	if err != nil {
		panic(err)
	}

	mu := &sync.Mutex{}

	sema := semaphore.NewWeighted(20)

	polyfillsMap := map[string][]string{}
	for _, f := range mapping {
		if len(f.PolyfillIO) > 0 {
			sort.Strings(f.PolyfillIO)
			b, err := json.Marshal(f.PolyfillIO)
			if err != nil {
				panic(err)
			}

			polyfillsMap[string(b)] = f.PolyfillIO
		}
	}

	for _, polyfills := range polyfillsMap {
		for _, browser := range uas {
			if err := sema.Acquire(context.Background(), 1); err != nil {
				panic(err)
			}

			go func(p []string, browser browserua.UserAgent) {
				defer sema.Release(1)

				browserB := map[string][]byte{}

				b, err := getPolyfillIOContent(p, browser)
				if err != nil {
					panic(err)
				}

				singleSum := sha256.Sum256(b)

				browserB[fmt.Sprintf("%x", singleSum)] = b

				parts := []byte{}
				for _, b := range browserB {
					parts = append(parts, b...)
				}

				sum := sha256.Sum256(parts)

				mu.Lock()
				defer mu.Unlock()
				store.InsertPolyfillIOHash(context.Background(), db, priority.PolyfillIOHash{
					List: p,
					UA:   browser.UserAgent,
					Hash: fmt.Sprintf("%x", sum),
				})

			}(polyfills, browser)
		}
	}

	if err := sema.Acquire(context.Background(), 20); err != nil {
		panic(err)
	}
}

func getPolyfillIOContent(p []string, browser browserua.UserAgent) ([]byte, error) {
	polyfills := url.QueryEscape(strings.Join(p, ","))

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("https://polyfill.io/v3/polyfill.min.js?features=%s", polyfills), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", browser.UserAgent)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("unexpected status code for \"%s\", : %d", fmt.Sprintf("https://polyfill.io/v3/polyfill.min.js?features=%s", polyfills), resp.StatusCode)
	}

	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return b, nil
}
