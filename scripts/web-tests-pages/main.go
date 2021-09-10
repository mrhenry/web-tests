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

func main() {
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

		totalFeatures++

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

							weightedScore := weightScoreByUsageDataForBrowserWithVersion(usageData, results.browserWithVersion, 1)
							scores.addScore(test, weightedScore)
						} else {
							tableBody = tableBody + "<td>" + fmt.Sprintf("%0.1f", result.Score) + "</td>"

							weightedScore := weightScoreByUsageDataForBrowserWithVersion(usageData, results.browserWithVersion, result.Score)
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

		totalPoints.sum(scores)

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

func resultKey(x result.Result) string {
	if x.OS != "" {
		return fmt.Sprintf("%s/%s", x.OS, x.BrowserVersion)
	}

	return fmt.Sprintf("%s/%s", x.Browser, x.BrowserVersion)
}

type Scores map[string][]float64

func (x Scores) sum(y Scores) {
	c := Scores{}
	for k, v := range y {
		c[k] = v
	}

	{
		_, hasPurePolyfillIOResult := c["pure_polyfillio"]
		pureResult, hasPureResult := c["pure"]
		if !hasPurePolyfillIOResult && hasPureResult {
			c["pure_polyfillio"] = pureResult
		}
	}

	{
		_, hasBabelPolyfillIOResult := c["babel_polyfillio"]
		babelResult, hasBabelResult := c["babel"]
		if !hasBabelPolyfillIOResult && hasBabelResult {
			c["babel_polyfillio"] = babelResult
		}
	}

	for ck, cv := range c {
		if xv, ok := x[ck]; ok {
			x[ck] = append(xv, cv...)
		} else {
			x[ck] = cv
		}
	}
}

func (x Scores) addScore(test string, score float64) {
	if y, ok := x[test]; ok {
		x[test] = append(y, score)
	} else {
		x[test] = []float64{score}
	}
}

func (x Scores) table(order []string) string {
	avgScores := map[string]float64{}

	for k, v := range x {
		avgScores[k] = 0

		for _, vv := range v {
			avgScores[k] += vv
		}

		avgScores[k] = avgScores[k] / float64(len(v))
	}

	tableContents := ""

	for _, test := range order {
		v, ok := avgScores[test]
		if !ok {
			continue
		}

		tableContents = tableContents + `<tr><td>` + test + `</td><td>` + fmt.Sprintf("%sN", numberOfNines(v)) + `</tr>` + "\n"
	}

	return `<table><tbody>` + tableContents + `</tbody></table>` + "\n"
}

type Points map[string]int

func (x Points) sum(y Scores) {
	avgScores := map[string]float64{}

	for k, v := range y {
		avgScores[k] = 0

		for _, vv := range v {
			avgScores[k] += vv
		}

		avgScores[k] = avgScores[k] / float64(len(v))
	}

	{
		_, hasPurePolyfillIOResult := avgScores["pure_polyfillio"]
		pureResult, hasPureResult := avgScores["pure"]
		if !hasPurePolyfillIOResult && hasPureResult {
			avgScores["pure_polyfillio"] = pureResult
		}
	}

	{
		_, hasBabelPolyfillIOResult := avgScores["babel_polyfillio"]
		babelResult, hasBabelResult := avgScores["babel"]
		if !hasBabelPolyfillIOResult && hasBabelResult {
			avgScores["babel_polyfillio"] = babelResult
		}
	}

	for ck, score := range avgScores {
		if score >= 0.99999 {
			x[ck] = x[ck] + 1
		}
	}
}

func (x Points) table(order []string, featuresTested int) string {
	tableContents := ""

	for _, test := range order {
		v, ok := x[test]
		if !ok {
			continue
		}

		tableContents = tableContents + `<tr><td>` + test + `</td><td>` + fmt.Sprintf("%d", v) + ` / ` + fmt.Sprintf("%d", featuresTested) + `</tr>` + "\n"
	}

	return `<table><tbody>` + tableContents + `</tbody></table>` + "\n"
}

func scoreToInt(v float64) int {
	if v >= 0.9 {
		return 1
	}

	return 0
}

func numberOfNines(v float64) string {
	if v >= 0.9999999999 {
		return "∞"
	}
	if v >= 0.999999999 {
		return "9"
	}

	if v >= 0.99999999 {
		return "8"
	}

	if v >= 0.9999999 {
		return "7"
	}

	if v >= 0.999999 {
		return "6"
	}

	if v >= 0.99999 {
		return "5"
	}

	if v >= 0.9999 {
		return "4"
	}

	if v >= 0.999 {
		return "3"
	}

	if v >= 0.99 {
		return "2"
	}

	if v >= 0.9 {
		return "1"
	}

	return "0"
}
