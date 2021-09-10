package main

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/mrhenry/web-tests/scripts/result"
	"github.com/mrhenry/web-tests/scripts/store"
)

func main() {
	db, err := store.NewSqliteDatabase("./web-tests.db", false)
	if err != nil {
		panic(err)
	}

	featureDirs := []string{}

	err = filepath.Walk("./specifications", func(path string, info os.FileInfo, err error) error {
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
		featureMetaFilePath := filepath.Join(featureDir, "meta.json")

		f, err := os.Open(featureMetaFilePath)
		if err != nil {
			log.Fatal(err)
		}

		defer f.Close()

		b, err := ioutil.ReadAll(f)
		if err != nil {
			log.Fatal(err)
		}

		err = f.Close()
		if err != nil {
			log.Fatal(err)
		}

		item := feature.FeatureInMapping{}
		err = json.Unmarshal(b, &item)
		if err != nil {
			log.Fatal(err)
		}

		item.Dir = featureDir

		err = store.UpsertFeature(context.Background(), db, item)
		if err != nil {
			panic(err)
		}

		results, err := store.SelectResultsForFeature(context.Background(), db, item)
		if err != nil {
			panic(err)
		}

		hashMap := map[string]string{}

		if len(results) > 0 {

			for _, r := range results {
				hash, ok := hashMap[r.Test]
				if !ok {
					hash, err = item.ContentHashForTest(r.Test)
					if err != nil {
						panic(err)
					}

					hashMap[r.Test] = hash
				}

				if hash != r.Hash {
					r.Hash = hash
					r.Priority = r.Priority + 1
					if r.Priority > 10 {
						r.Priority = 10
					}
					err = store.UpdateResult(context.Background(), db, r)
					if err != nil {
						panic(err)
					}
				}
			}
		} else {
			allUAs, err := store.SelectAllBrowsers(context.Background(), db)
			if err != nil {
				panic(err)
			}

			for _, ua := range allUAs {
				for test := range item.Tests {
					hash, ok := hashMap[test]
					if !ok {
						hash, err = item.ContentHashForTest(test)
						if err != nil {
							panic(err)
						}

						hashMap[test] = hash
					}

					err = store.UpsertResult(context.Background(), db, result.Result{
						Browser:        ua.Browser,
						BrowserVersion: ua.BrowserVersion,
						FeatureID:      item.ID,
						OS:             ua.OS,
						OSVersion:      ua.OSVersion,
						Test:           test,

						Hash:     hash,
						Priority: 5,
						Score:    -1,
					})
					if err != nil {
						panic(err)
					}
				}
			}
		}
	}
}
