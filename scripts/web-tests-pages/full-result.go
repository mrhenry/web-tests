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

type ResultsByBrowser struct {
	fullyQualifiedBrowserVersion string
	browserNameForResults        string
	browser                      string
	browserVersion               string
	featureID                    string
	os                           string
	osVersion                    string
	results                      map[string]result.Result
}

func fullResult() {
	totalPoints5 := Points{
		threshold: 0.99999,
		p:         map[string]int{},
	}
	totalPoints4 := Points{
		threshold: 0.9999,
		p:         map[string]int{},
	}
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

	significantUAVersion, err := significantUAVersionMapper(context.Background(), db)
	if err != nil {
		log.Fatal(err)
	}

	for _, feature := range features {
		if feature.ID != "dfe2dfb3-716b-4af7-9fc6-aa4ccfb75b49" { // don't count "ecma262 The this Keyword"
			totalFeatures++
		}

		results := map[string]ResultsByBrowser{}
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

				byBrowser, ok := results[significantUAVersion(r)]
				if !ok {
					byBrowser = ResultsByBrowser{
						fullyQualifiedBrowserVersion: significantUAVersion(r),
						browser:                      r.Browser,
						browserVersion:               r.BrowserVersion,
						browserNameForResults:        r.Browser,
						os:                           r.OS,
						osVersion:                    r.OSVersion,
						results:                      map[string]result.Result{},
					}

					if byBrowser.os == "ios" {
						byBrowser.browserNameForResults = "ios"
					}
				}

				_, ok = byBrowser.results[r.Test]
				if ok {
					panic(fmt.Sprintf("duplicate result for %s %s | %s/%s", r.Test, significantUAVersion(r), r.Browser, r.BrowserVersion))
				}

				byBrowser.results[r.Test] = r

				results[significantUAVersion(r)] = byBrowser
			}
		}

		{
			resultsByBrowserVersion := []ResultsByBrowser{}

			for _, byBrowser := range results {
				resultsByBrowserVersion = append(resultsByBrowserVersion, byBrowser)
			}

			sort.Slice(resultsByBrowserVersion, func(i int, j int) bool {
				browserI := resultsByBrowserVersion[i].browserNameForResults
				browserVersionI := resultsByBrowserVersion[i].browserVersion
				browserJ := resultsByBrowserVersion[j].browserNameForResults
				browserVersionJ := resultsByBrowserVersion[j].browserVersion

				if browserI == browserJ {
					v1, _ := version.NewVersion(browserVersionI)
					v2, _ := version.NewVersion(browserVersionJ)

					if v1 != nil && v2 != nil {
						return v1.GreaterThan(v2)
					}

					return browserVersionI > browserVersionJ
				}

				return browserI < browserJ
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
					if byBrowser.browserNameForResults != lastBrowser && lastBrowser != "" {
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

						lastBrowser = byBrowser.browserNameForResults
					}

					if lastBrowser == "" {
						lastBrowser = byBrowser.browserNameForResults
					}

					currentResults = append(currentResults, struct {
						browserWithVersion string
						results            map[string]result.Result
					}{
						browserWithVersion: byBrowser.fullyQualifiedBrowserVersion,
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
				detailSummary := `<details><summary>` + byBrowser.browser + `</summary><div class="table-container"><table>`

				tableHeading := "<thead><tr><th></th>"

				for _, test := range testsSlice {
					tableHeading = tableHeading + "<th>" + test + "</th>\n"
				}

				tableHeading = tableHeading + "</tr></thead>\n"

				tableBody := "<tbody>"

				for _, results := range byBrowser.byBrowser {
					tableBody = tableBody + "<tr>\n"
					tableBody = tableBody + "<td>" + results.browserWithVersion + "</td>"

					for _, test := range testsSlice {
						result, ok := results.results[test]
						if !ok {
							tableBody = tableBody + "<td>?</td>"

							if result.OS == "ios" {
								continue
							}

							weightedScore := weightScoreByUsageDataForBrowserWithVersion(usageData, significantUAVersion(result), 1)
							scores.addScore(test, weightedScore)
						} else {
							tableBody = tableBody + "<td>" + fmt.Sprintf("%0.1f", result.Score) + "</td>"

							if result.OS == "ios" {
								continue
							}

							weightedScore := weightScoreByUsageDataForBrowserWithVersion(usageData, significantUAVersion(result), result.Score)
							scores.addScore(test, weightedScore)
						}
					}

					tableBody = tableBody + "\n</tr>\n"
				}

				tableBody = tableBody + "</tbody>\n"

				detailSummary = detailSummary + tableHeading + tableBody + "</div></table></details>\n"

				featureDetails = featureDetails + `<div class="feature-results">` + detailSummary + `</div>` + "\n"
			}
		}

		totalPoints5.sum(scores)
		totalPoints4.sum(scores)

		featureSummary := `<summary id="` + feature.ID + `">` + feature.Spec.ID + " " + feature.Spec.Name + `<br>` + scores.table(testsSlice) + `</summary>`
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

	prioritySum, err := store.SelectSumResultsPriority(context.Background(), db)
	if err != nil {
		log.Fatal(err)
	}

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
	<p><i>Maybe stable after ` + fmt.Sprint(prioritySum) + ` more tests</i></p>
	` + out + `
</body>
</html>`

		f, err := os.Create("docs/index.html")
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
