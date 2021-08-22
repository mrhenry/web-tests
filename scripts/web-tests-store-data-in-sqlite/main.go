package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/mrhenry/web-tests/scripts/feature"
	"github.com/mrhenry/web-tests/scripts/result"
	"github.com/mrhenry/web-tests/scripts/store"
)

func main() {
	db, err := store.NewSqliteDatabase("./web-tests.db", false)
	if err != nil {
		log.Fatal(err)
	}

	featureDirs := []string{}

	testRegExp := regexp.MustCompile(`results\/([\w_-]+)\/`)

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
		feature := feature.FeatureInMapping{}

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

			feature.Dir = featureDir

			ok, err := store.ExistsFeature(context.Background(), db, feature)
			if err != nil {
				log.Fatal(err)
			}

			if !ok {
				err = store.InsertFeature(context.Background(), db, feature)
				if err != nil {
					log.Fatal(err)
				}
			} else {
				err = store.UpdateFeature(context.Background(), db, feature)
				if err != nil {
					log.Fatal(err)
				}
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
				}

				return nil
			})
			if err != nil {
				log.Fatal(err)
			}

			for _, resultPath := range resultPaths {
				result := result.Result{}
				fR, err := os.Open(resultPath)
				if err != nil {
					log.Fatal(err)
				}

				testName := testRegExp.FindStringSubmatch(resultPath)[1]

				defer fR.Close()

				decoder := json.NewDecoder(fR)

				err = decoder.Decode(&result)
				if err != nil {
					log.Fatal(err)
				}

				err = fR.Close()
				if err != nil {
					log.Fatal(err)
				}

				result.FeatureID = feature.ID
				result.Test = testName

				ok, err := store.ExistsResult(context.Background(), db, result)
				if err != nil {
					log.Fatal(err)
				}

				if !ok {
					err = store.InsertResult(context.Background(), db, result)
					if err != nil {
						log.Fatal(err)
					}
				} else {
					err = store.UpdateResult(context.Background(), db, result)
					if err != nil {
						log.Fatal(err)
					}
				}
			}
		}
	}
}
