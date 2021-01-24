package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	version "github.com/hashicorp/go-version"
	"github.com/romainmenke/web-tests/scripts/feature"
)

func main() {
	featureDirs := []string{}

	out := ""

	err := filepath.Walk("./specifications", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if strings.HasSuffix(path, "meta.json") {
			featureDirs = append(featureDirs, filepath.Dir(path))
		}

		return nil
	})
	if err != nil {
		log.Fatal(err)
	}

	for _, featureDir := range featureDirs {
		feature := feature.FeatureWithDir{}
		results := map[string]map[string]Result{}
		tests := map[string]struct{}{}
		testsSlice := []string{}

		scores := map[string][]float64{}

		{
			f, err := os.Open(filepath.Join(featureDir, "meta.json"))
			if err != nil {
				log.Fatal(err)
			}

			defer f.Close()

			decoder := json.NewDecoder(f)

			err = decoder.Decode(&feature)
			if err != nil {
				log.Fatal(err)
			}

			err = f.Close()
			if err != nil {
				log.Fatal(err)
			}
		}

		featureDetails := ""

		{
			resultPaths := []string{}
			err = filepath.Walk(filepath.Join(featureDir, "results"), func(path string, info os.FileInfo, err error) error {
				if err != nil {
					return err
				}

				if strings.HasSuffix(path, ".json") {
					resultPaths = append(resultPaths, path)
					tests[filepath.Base(filepath.Dir(path))] = struct{}{}
				}

				return nil
			})
			if err != nil {
				log.Fatal(err)
			}

			for k := range tests {
				testsSlice = append(testsSlice, k)
			}

			sort.Sort(sort.StringSlice(testsSlice))

			for _, resultPath := range resultPaths {
				result := Result{}
				f, err := os.Open(resultPath)
				if err != nil {
					log.Fatal(err)
				}

				defer f.Close()

				decoder := json.NewDecoder(f)

				err = decoder.Decode(&result)
				if err != nil {
					log.Fatal(err)
				}

				err = f.Close()
				if err != nil {
					log.Fatal(err)
				}

				byBrowser, ok := results[result.resultKey()]
				if !ok {
					byBrowser = map[string]Result{}
				}

				byBrowser[filepath.Base(filepath.Dir(resultPath))] = result

				results[result.resultKey()] = byBrowser
			}
		}

		{
			resultsByBrowserVersion := []struct {
				browser string
				results map[string]Result
			}{}

			for browser, byBrowser := range results {
				resultsByBrowserVersion = append(resultsByBrowserVersion, struct {
					browser string
					results map[string]Result
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

				return parts1[0] > parts2[0]
			})

			resultsByBrowser := []struct {
				browser   string
				byBrowser []struct {
					browserWithVersion string
					results            map[string]Result
				}
			}{}

			{
				lastBrowser := ""
				currentResults := []struct {
					browserWithVersion string
					results            map[string]Result
				}{}

				for i, byBrowser := range resultsByBrowserVersion {
					if strings.Split(byBrowser.browser, "/")[0] != lastBrowser && lastBrowser != "" {
						resultsByBrowser = append(resultsByBrowser, struct {
							browser   string
							byBrowser []struct {
								browserWithVersion string
								results            map[string]Result
							}
						}{
							browser:   lastBrowser,
							byBrowser: currentResults,
						})

						currentResults = []struct {
							browserWithVersion string
							results            map[string]Result
						}{}

						lastBrowser = strings.Split(byBrowser.browser, "/")[0]
					}

					if lastBrowser == "" {
						lastBrowser = strings.Split(byBrowser.browser, "/")[0]
					}

					currentResults = append(currentResults, struct {
						browserWithVersion string
						results            map[string]Result
					}{
						browserWithVersion: byBrowser.browser,
						results:            byBrowser.results,
					})

					if i == (len(resultsByBrowserVersion) - 1) {
						resultsByBrowser = append(resultsByBrowser, struct {
							browser   string
							byBrowser []struct {
								browserWithVersion string
								results            map[string]Result
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
					tableHeading = tableHeading + "<th>" + test + "</th>"
				}

				tableHeading = tableHeading + "</tr></thead>"

				tableBody := "<tbody>"

				for _, results := range byBrowser.byBrowser {
					tableBody = tableBody + "<tr>"
					tableBody = tableBody + "<td>" + results.browserWithVersion + "</td>"

					for _, test := range testsSlice {
						result, ok := results.results[test]
						if !ok {
							tableBody = tableBody + "<td>?</td>"

							if x, ok := scores[test]; ok {
								scores[test] = append(x, 0.5)
							} else {
								scores[test] = []float64{0.5}
							}

						} else {
							tableBody = tableBody + "<td>" + fmt.Sprintf("%0.2f", result.Score) + "</td>"

							if x, ok := scores[test]; ok {
								scores[test] = append(x, result.Score)
							} else {
								scores[test] = []float64{result.Score}
							}
						}
					}

					tableBody = tableBody + "</tr>"
				}

				tableBody = tableBody + "</tbody>"

				detailSummary = detailSummary + tableHeading + tableBody + "</div></table></details>"

				featureDetails = featureDetails + `<div class="feature-results">` + detailSummary + `</div>`
			}
		}

		avgScores := map[string]float64{}
		for k, v := range scores {
			avgScores[k] = 0

			for _, vv := range v {
				avgScores[k] += vv
			}

			avgScores[k] = avgScores[k] / float64(len(v))
		}

		avgScoresDescriptionList := ""

		for _, test := range testsSlice {
			v, ok := avgScores[test]
			if !ok {
				continue
			}

			avgScoresDescriptionList = avgScoresDescriptionList + `<tr><td>` + test + `</td><td>` + fmt.Sprintf("%0.2f", v) + `</tr>`
		}

		featureScores := `<table><tbody>` + avgScoresDescriptionList + `</tbody></table>`

		featureSummary := `<summary>` + feature.Spec.ID + " " + feature.Spec.Name + `<br>` + featureScores + `</summary>`
		out = out + `<details>` + featureSummary + featureDetails + `
<ul>
	<li>` + feature.Spec.Org + `</li>
	<li>` + feature.Spec.ID + `</li>
	<li><a href="` + feature.Spec.URL + `" target="_blank" rel="noopener">` + feature.Spec.Section + `</a></li>
</ul>
</details>`
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
	` + out + `
</body>
</html>`

		f, err := os.Create("docs/results.html")
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

type Result struct {
	Browser        string  `json:"browser"`
	BrowserVersion string  `json:"browser_version"`
	OS             string  `json:"os"`
	OSVersion      string  `json:"os_version"`
	Score          float64 `json:"score"`
}

func (x Result) resultKey() string {
	if x.OS != "" {
		return fmt.Sprintf("%s/%s", x.OS, x.OSVersion)
	}

	return fmt.Sprintf("%s/%s", x.Browser, x.BrowserVersion)
}
