package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"sort"
	"strings"

	version "github.com/hashicorp/go-version"
	"github.com/mrhenry/web-tests/scripts/result"
	"github.com/mrhenry/web-tests/scripts/store"
)

func failingCoreWeb() {
	totalPoints := Points{}
	totalTests := map[string]struct{}{}
	totalFeatures := 0

	out := ""

	usageData, err := getUsageData(context.Background())
	if err != nil {
		log.Fatal(err)
	}

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

		scores := Scores{}

		featureDetails := ""

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
				totalTests[r.Test] = struct{}{}
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
				hasFailing := false

				detailSummary := `<details><summary>` + byBrowser.browser + `</summary><div class="table-container"><table>`

				tableHeading := "<thead><tr><th></th>"

				for _, test := range testsSlice {
					tableHeading = tableHeading + "<th>" + test + "</th>\n"
				}

				tableHeading = tableHeading + "</tr></thead>\n"

				tableBody := "<tbody>"

				for _, results := range byBrowser.byBrowser {
					tableBody = tableBody + "<tr>\n"

					for _, test := range testsSlice {
						result, ok := results.results[test]
						if !ok {
							weightedScore := weightScoreByUsageDataForBrowserWithVersion(usageData, results.browserWithVersion, 1)
							scores.addScore(test, weightedScore)
						} else {
							if result.Score < 1 {
								hasFailing = true
								tableBody = tableBody + "<td>" + results.browserWithVersion + "</td>"
								tableBody = tableBody + "<td>" + fmt.Sprintf("%0.1f", result.Score) + "</td>"
							}

							weightedScore := weightScoreByUsageDataForBrowserWithVersion(usageData, results.browserWithVersion, result.Score)
							scores.addScore(test, weightedScore)
						}
					}

					tableBody = tableBody + "\n</tr>\n"
				}

				tableBody = tableBody + "</tbody>\n"

				detailSummary = detailSummary + tableHeading + tableBody + "</div></table></details>\n"

				if hasFailing {
					featureDetails = featureDetails + `<div class="feature-results">` + detailSummary + `</div>` + "\n"
				}
			}
		}

		totalPoints.sum(scores)
		scoresTable := scores.tableIfFailing(testsSlice)
		if scoresTable == "" {
			continue
		}

		featureSummary := `<summary id="` + feature.ID + `">` + feature.Spec.ID + " " + feature.Spec.Name + `<br>` + scoresTable + `</summary>`
		out = out + `<details>` + featureSummary + featureDetails + `
<ul>
	<li>` + feature.Spec.Org + `</li>
	<li>` + feature.Spec.ID + `</li>
	<li><a href="` + feature.Spec.URL + `" target="_blank" rel="noopener">` + feature.Spec.Section + `</a></li>
	<li><a href="#` + feature.ID + `">🔗</a></li>
	</ul>
</details>`
	}

	testsSlice := []string{}
	for k := range totalTests {
		testsSlice = append(testsSlice, k)
	}

	sort.Sort(sort.StringSlice(testsSlice))

	{
		resultsHTML := `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />
	<link rel="icon" href="data:;base64,iVBORw0KGgo=">

	<style>
		body {
			font-size: 16px;
		}

		* {
			font-family: monospace;
		}

		.feature-results {
			width: 100%;
		}

		.table-container {
			max-height: 450px;
			overflow: scroll;
		}

		table, th, td {
			border: 1px solid #ccc;
			border-collapse: collapse;
		}

		th, td {
			padding: 3px 5px;
		}

		table {
			content-visibility: auto;
			max-height: 600px;
			max-width: 1000px;
			overflow: scroll;
			margin: 10px 0;
			text-align: left;
			width: 100%
		}

		td + td {
			text-align: right;
		}

		th {
			background-color: white;
			position: sticky;
			top: 0;
		}

		details {
			max-width: 1000px;
			padding: 10px 0;
		}

		summary {
			border-radius: 0;
			padding: 10px 5px;
		}

		details details {
			margin-left: 25px;
		}
	</style>
</head>
<body>
	<a href="https://github.com/mrhenry/web-tests">https://github.com/mrhenry/web-tests</a><br>
	` + totalPoints.table(testsSlice, totalFeatures) + out + `
</body>
</html>`

		f, err := os.Create("docs/failing-core-web.html")
		if err != nil {
			log.Fatal(err)
		}

		defer f.Close()

		_, err = f.WriteString(resultsHTML)
		if err != nil {
			log.Fatal(err)
		}

		err = f.Close()
		if err != nil {
			log.Fatal(err)
		}
	}
}
