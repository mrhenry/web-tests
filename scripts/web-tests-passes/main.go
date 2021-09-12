package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"sort"
	"strings"

	semver "github.com/blang/semver/v4"
	version "github.com/hashicorp/go-version"
	"github.com/mrhenry/web-tests/scripts/result"
	"github.com/mrhenry/web-tests/scripts/store"
)

func main() {
	hasFailures := false

	query := "safari >= 8.0.0, opera >= 26.0.0, firefox >= 26.0.0, edge >= 12.0.0, chrome >= 31.0.0"

	browsersList := strings.Split(query, ",")
	for i, v := range browsersList {
		browsersList[i] = strings.TrimSpace(v)
	}

	browserQueries := map[string]semver.Range{}
	for _, browser := range browsersList {
		parts := strings.SplitN(browser, " ", 2)
		browserName := parts[0]
		browserVersionRange := parts[1]

		versionRange := semver.MustParseRange(browserVersionRange)
		browserQueries[strings.ToLower(browserName)] = versionRange
	}

	totalFeatures := 0

	db, err := store.NewSqliteDatabase("./web-tests.db", false)
	if err != nil {
		log.Fatal(err)
	}

	features, err := store.SelectAllFeatures(context.Background(), db)
	if err != nil {
		log.Fatal(err)
	}

	for _, feature := range features {
		if strings.Contains(feature.Dir, "example/test") {
			continue
		}

		if feature.ID != "dfe2dfb3-716b-4af7-9fc6-aa4ccfb75b49" { // don't count "ecma262 The this Keyword"
			totalFeatures++
		}

		results := map[string]map[string]result.Result{}
		tests := map[string]struct{}{}
		testsSlice := []string{}

		allResultsForFeature, err := store.SelectResultsForFeature(context.Background(), db, feature)
		if err != nil {
			log.Fatal(err)
		}

		{
			for _, r := range allResultsForFeature {
				if r.Test != "core-web" {
					continue
				}

				tests[r.Test] = struct{}{}
			}

			for k := range tests {
				testsSlice = append(testsSlice, k)
			}

			sort.Sort(sort.StringSlice(testsSlice))

			for _, r := range allResultsForFeature {
				if r.Score == -1 {
					continue
				}

				if r.Test != "core-web" {
					continue
				}

				browserName := r.Browser
				if r.OS == "ios" {
					browserName = "ios_saf"
				}

				if _, ok := browserQueries[browserName]; !ok {
					continue
				}

				browserVersion, err := semver.ParseTolerant(r.BrowserVersion)
				if err != nil {
					panic(err)
				}

				if !browserQueries[browserName](browserVersion) {
					continue
				}

				byBrowser, ok := results[resultKey(r)]
				if !ok {
					byBrowser = map[string]result.Result{}
				}

				byBrowser[r.Test] = r

				results[resultKey(r)] = byBrowser
			}
		}

		{
			resultsByBrowserVersion := []struct {
				browser string
				results map[string]result.Result
			}{}

			for browser, byBrowser := range results {
				resultsByBrowserVersion = append(resultsByBrowserVersion, struct {
					browser string
					results map[string]result.Result
				}{
					browser: browser,
					results: byBrowser,
				})
			}

			sort.Slice(resultsByBrowserVersion, func(i int, j int) bool {
				parts1 := strings.Split(resultsByBrowserVersion[i].browser, "/")
				parts2 := strings.Split(resultsByBrowserVersion[j].browser, "/")

				if parts1[0] == parts2[0] {
					v1, _ := version.NewVersion(parts1[1])
					v2, _ := version.NewVersion(parts2[1])

					if v1 != nil && v2 != nil {
						return v1.GreaterThan(v2)
					}

					return parts1[1] > parts2[1]
				}

				return parts1[0] < parts2[0]
			})

			resultsByBrowser := []struct {
				browser   string
				byBrowser []struct {
					browserWithVersion string
					results            map[string]result.Result
				}
			}{}

			{
				lastBrowser := ""
				currentResults := []struct {
					browserWithVersion string
					results            map[string]result.Result
				}{}

				for i, byBrowser := range resultsByBrowserVersion {
					if strings.Split(byBrowser.browser, "/")[0] != lastBrowser && lastBrowser != "" {
						resultsByBrowser = append(resultsByBrowser, struct {
							browser   string
							byBrowser []struct {
								browserWithVersion string
								results            map[string]result.Result
							}
						}{
							browser:   lastBrowser,
							byBrowser: currentResults,
						})

						currentResults = []struct {
							browserWithVersion string
							results            map[string]result.Result
						}{}

						lastBrowser = strings.Split(byBrowser.browser, "/")[0]
					}

					if lastBrowser == "" {
						lastBrowser = strings.Split(byBrowser.browser, "/")[0]
					}

					currentResults = append(currentResults, struct {
						browserWithVersion string
						results            map[string]result.Result
					}{
						browserWithVersion: byBrowser.browser,
						results:            byBrowser.results,
					})

					if i == (len(resultsByBrowserVersion) - 1) {
						resultsByBrowser = append(resultsByBrowser, struct {
							browser   string
							byBrowser []struct {
								browserWithVersion string
								results            map[string]result.Result
							}
						}{
							browser:   strings.Split(byBrowser.browser, "/")[0],
							byBrowser: currentResults,
						})
					}
				}
			}

			for _, byBrowser := range resultsByBrowser {
				for _, results := range byBrowser.byBrowser {
					for _, test := range testsSlice {
						result, ok := results.results[test]
						if ok && result.Score < 1 {
							fmt.Printf("failing : %s with %s in %s\n", feature.Spec.Name, test, resultKey(result))
							hasFailures = true
						}
					}
				}
			}
		}

	}

	if hasFailures {
		os.Exit(1)
	}
}
