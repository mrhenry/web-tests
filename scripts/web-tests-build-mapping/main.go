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
	}
}
