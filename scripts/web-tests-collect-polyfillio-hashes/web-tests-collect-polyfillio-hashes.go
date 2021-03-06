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
	"sort"
	"strings"
	"sync"

	"github.com/mrhenry/web-tests/scripts/browserua"
	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/mrhenry/web-tests/scripts/priority"
	"golang.org/x/sync/semaphore"
)

func main() {
	browserUAs, err := getBrowserUAs()
	if err != nil {
		log.Fatal(err)
	}

	mapping, err := getMapping()
	if err != nil {
		log.Fatal(err)
	}

	mu := &sync.Mutex{}
	fingerPrints := []priority.Fingerprint{}

	sema := semaphore.NewWeighted(20)

	i := 0
	for _, f := range mapping {
		if len(f.PolyfillIO) > 0 {

			j := 0
			for _, browser := range browserUAs {
				if err := sema.Acquire(context.Background(), 1); err != nil {
					log.Fatal(err)
				}

				go func(i int, iLen int, j int, jLen int, f feature.FeatureInMapping, browser *browserua.BrowserUAs) {
					defer sema.Release(1)

					browserB := map[string][]byte{}

					sort.Strings(browser.UAs)

					for k, ua := range browser.UAs {

						b, err := getPolyfillIOContent(i, iLen, j, jLen, k, len(browser.UAs), f, browser, ua)
						if err != nil {
							panic(err)
						}

						singleSum := sha256.Sum256(b)

						browserB[fmt.Sprintf("%x", singleSum)] = b
					}

					parts := []byte{}
					for _, b := range browserB {
						parts = append(parts, b...)
					}

					sum := sha256.Sum256(parts)

					mu.Lock()
					defer mu.Unlock()
					fingerPrints = append(fingerPrints, priority.Fingerprint{
						FeatureID:      f.ID,
						PolyfillIOHash: fmt.Sprintf("%x", sum),
						BrowserKey:     browser.Key,
					})

				}(i, len(mapping), j, len(browserUAs), f, browser)

				j++
			}
		}

		i++
	}

	if err := sema.Acquire(context.Background(), 20); err != nil {
		log.Fatal(err)
	}

	err = saveFingerprints(fingerPrints)
	if err != nil {
		log.Fatal(err)
	}
}

func getPolyfillIOContent(i int, iLen int, j int, jLen int, k int, kLen int, f feature.FeatureInMapping, browser *browserua.BrowserUAs, ua string) ([]byte, error) {
	polyfills := url.QueryEscape(strings.Join(f.PolyfillIO, ","))

	// log.Printf(
	// 	"%d/%d|%d/%d|%d/%d : %s - %s",
	// 	i, iLen,
	// 	j, jLen,
	// 	k, kLen,
	// 	polyfills,
	// 	ua,
	// )

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("https://polyfill.io/v3/polyfill.min.js?features=%s", polyfills), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", ua)

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

func saveFingerprints(fingerprints []priority.Fingerprint) error {
	f, err := os.Create("data/polyfillio-hashes.json")
	if err != nil {
		return err
	}

	defer f.Close()

	sort.Slice(fingerprints, func(i int, j int) bool {
		if fingerprints[i].FeatureID == fingerprints[j].FeatureID {
			return fingerprints[i].BrowserKey < fingerprints[j].BrowserKey
		}

		return fingerprints[i].FeatureID < fingerprints[j].FeatureID
	})

	b, err := json.MarshalIndent(fingerprints, "", "  ")
	if err != nil {
		return err
	}

	_, err = f.Write(b)
	if err != nil {
		return err
	}

	_, err = f.WriteString("\n")
	if err != nil {
		return err
	}

	return nil
}

func getBrowserUAs() (map[string]*browserua.BrowserUAs, error) {
	f, err := os.Open("data/uas.json")
	if err != nil {
		return nil, err
	}

	defer f.Close()

	b, err := ioutil.ReadAll(f)
	if err != nil {
		return nil, err
	}

	browserUAs := map[string]*browserua.BrowserUAs{}
	err = json.Unmarshal(b, &browserUAs)
	if err != nil {
		return nil, err
	}

	return browserUAs, nil
}

func uniqueStringSlice(s []string) []string {
	track := make(map[string]bool, len(s))
	unique := make([]string, 0, len(s))
	for _, elem := range s {
		if elem == "" {
			continue
		}

		if _, ok := track[elem]; !ok {
			unique = append(unique, elem)
			track[elem] = true
		}
	}

	return unique
}
