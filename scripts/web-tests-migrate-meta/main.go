package main

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/mrhenry/web-tests/scripts/feature"
)

func main() {
	featureDirs := []string{}

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
		func(dir string) {
			feature := feature.Feature{}

			{
				f1, err := os.Open(filepath.Join(dir, "meta.json"))
				if err != nil {
					log.Fatal(err)
				}

				defer f1.Close()

				decoder := json.NewDecoder(f1)

				err = decoder.Decode(&feature)
				if err != nil {
					log.Fatal(err)
				}

				err = f1.Close()
				if err != nil {
					log.Fatal(err)
				}
			}

			postMigration := FeaturePostMigration{}
			postMigration.ID = feature.ID
			postMigration.Spec.Org = feature.Spec.Org
			postMigration.Spec.ID = feature.Spec.ID
			postMigration.Spec.Section = feature.Spec.Section
			postMigration.Spec.Name = feature.Spec.Name
			postMigration.Spec.URL = feature.Spec.URL
			postMigration.Tests = feature.Tests

			sort.Strings(feature.PolyfillIO)
			postMigration.PolyfillIO = feature.PolyfillIO
			postMigration.Notes = feature.Notes
			postMigration.SearchTerms = feature.SearchTerms

			{
				f2, err := os.Create(filepath.Join(dir, "meta.json"))
				if err != nil {
					log.Fatal(err)
				}

				defer f2.Close()

				encoder := json.NewEncoder(f2)
				encoder.SetIndent("", "  ")

				err = encoder.Encode(&postMigration)
				if err != nil {
					log.Fatal(err)
				}

				err = f2.Close()
				if err != nil {
					log.Fatal(err)
				}
			}
		}(featureDir)
	}
}

type FeaturePostMigration struct {
	ID   string `json:"id"`
	Spec struct {
		Org     string `json:"org"`
		ID      string `json:"id"`
		Section string `json:"section"`
		Name    string `json:"name"`
		URL     string `json:"url"`
	} `json:"spec"`
	Notes []struct {
		Message string `json:"message"`
	} `json:"notes"`
	SearchTerms []string `json:"search_terms"`
	Tests       map[string]struct {
		InlineCSS       string `json:"inline_css,omitempty"`
		InlineHTML      string `json:"inline_html,omitempty"`
		InlineScript    string `json:"inline_script,omitempty"`
		ModuleScript    string `json:"module_script,omitempty"`
		NoModulesScript string `json:"nomodules_script,omitempty"`
		HasPolyfillIO   bool   `json:"has_polyfillio,omitempty"`
	} `json:"tests"`
	PolyfillIO []string `json:"polyfill.io"`
}
