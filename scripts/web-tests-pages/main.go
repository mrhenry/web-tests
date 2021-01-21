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

	tables := ""

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
			tableHeading := "<thead><tr><th>" + feature.Spec.Name + "</th>"

			for k := range tests {
				tableHeading = tableHeading + "<th>" + k + "</th>"
			}

			tableHeading = tableHeading + "</tr></thead>"

			tableBody := "<tbody>"

			resultsByBrowser := []struct {
				browser string
				results map[string]Result
			}{}

			for browser, byBrowser := range results {
				resultsByBrowser = append(resultsByBrowser, struct {
					browser string
					results map[string]Result
				}{
					browser: browser,
					results: byBrowser,
				})
			}

			sort.Slice(resultsByBrowser, func(i int, j int) bool {
				parts1 := strings.Split(resultsByBrowser[i].browser, "/")
				parts2 := strings.Split(resultsByBrowser[j].browser, "/")

				if parts1[0] == parts2[0] {
					v1, _ := version.NewVersion(parts1[1])
					v2, _ := version.NewVersion(parts2[1])

					if v1 != nil && v2 != nil {
						return v1.LessThan(v2)
					}

					return parts1[1] < parts2[1]
				}

				return parts1[0] < parts2[0]
			})

			for _, byBrowser := range resultsByBrowser {
				tableBody = tableBody + "<tr>"
				tableBody = tableBody + "<td>" + byBrowser.browser + "</td>"

				for k := range tests {
					result, ok := byBrowser.results[k]
					if !ok {
						tableBody = tableBody + "<td>?</td>"
					} else {
						tableBody = tableBody + "<td>" + fmt.Sprintf("%0.2f", result.Score) + "</td>"
					}
				}

				tableBody = tableBody + "</tr>"
			}

			tableBody = tableBody + "</tbody>"

			tables = tables + `<div class="feature-results">
<table>
` + tableHeading + `
` + tableBody + `
</table>
</div>`
		}
	}

	{
		resultsHTML := `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />
	<link rel="icon" href="data:;base64,iVBORw0KGgo=">

	<style>
		.feature-results {
			padding: 50px 0;
			width: 100%;
		}

		table {
			margin: 0 auto;
			max-width: 900px;
			text-align: left;
			width: 100%
		}
	</style>
</head>
<body>
	` + tables + `
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
