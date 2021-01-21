package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

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
			tableHeading := "<thead><tr>" + feature.Spec.Name + "<th></th>"

			for k := range tests {
				tableHeading = tableHeading + "<th>" + k + "</th>"
			}

			tableHeading = tableHeading + "</tr></thead>"

			tableBody := "<tbody>"

			for browser, byBrowser := range results {
				tableBody = tableBody + "<tr>"
				tableBody = tableBody + "<td>" + browser + "</td>"

				for k := range tests {
					result, ok := byBrowser[k]
					if !ok {
						log.Println("expected result for ", k)
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
