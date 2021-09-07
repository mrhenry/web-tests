package main

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"

	"github.com/mrhenry/web-tests/scripts/browserua"
	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/mrhenry/web-tests/scripts/priority"
	"github.com/mrhenry/web-tests/scripts/store"
	"golang.org/x/sync/semaphore"
)

func main() {
	db, err := store.NewSqliteDatabase("./data/data.db", false)
	if err != nil {
		log.Fatal(err)
	}

	uas, err := store.SelectAlUserAgents(context.Background(), db)
	if err != nil {
		log.Fatal(err)
	}

	mapping, err := getMapping()
	if err != nil {
		log.Fatal(err)
	}

	mu := &sync.Mutex{}

	sema := semaphore.NewWeighted(20)

	i := 0
	for _, f := range mapping {
		if len(f.PolyfillIO) > 0 {

			j := 0
			for _, browser := range uas {
				if err := sema.Acquire(context.Background(), 1); err != nil {
					log.Fatal(err)
				}

				go func(i int, iLen int, j int, jLen int, f feature.FeatureInMapping, browser browserua.UserAgent) {
					defer sema.Release(1)

					browserB := map[string][]byte{}

					b, err := getPolyfillIOContent(f, browser)
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
						List: f.PolyfillIO,
						UA:   browser.UserAgent,
						Hash: fmt.Sprintf("%x", sum),
					})

				}(i, len(mapping), j, len(uas), f, browser)

				j++
			}
		}

		i++
	}

	if err := sema.Acquire(context.Background(), 20); err != nil {
		log.Fatal(err)
	}
}

func getPolyfillIOContent(f feature.FeatureInMapping, browser browserua.UserAgent) ([]byte, error) {
	polyfills := url.QueryEscape(strings.Join(f.PolyfillIO, ","))

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

func getMapping() (feature.Mapping, error) {
	f, err := os.Open("lib/mapping.json")
	if err != nil {
		return nil, err
	}

	defer f.Close()

	b, err := ioutil.ReadAll(f)
	if err != nil {
		return nil, err
	}

	out := feature.Mapping{}

	err = json.Unmarshal(b, &out)
	if err != nil {
		return nil, err
	}

	return out, nil
}
