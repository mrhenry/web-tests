package main

import (
	"bytes"
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/mrhenry/web-tests/scripts/feature"
)

func main() {
	featureDirs := []string{}
	features := map[string]map[string]map[string]feature.FeatureWithDir{}

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

		item := feature.FeatureWithDir{}
		err = json.Unmarshal(b, &item)
		if err != nil {
			log.Fatal(err)
		}

		item.Dir = featureDir

		org, ok := features[item.Spec.Org]
		if !ok {
			org = map[string]map[string]feature.FeatureWithDir{}
		}

		spec, ok := org[item.Spec.ID]
		if !ok {
			spec = map[string]feature.FeatureWithDir{}
		}

		spec[item.Spec.Section] = item
		org[item.Spec.ID] = spec
		features[item.Spec.Org] = org
	}

	{
		f, err := os.Create("./lib/mapping.json")
		if err != nil {
			log.Fatal(err)
		}

		defer f.Close()

		b, err := json.MarshalIndent(features, "", "  ")
		if err != nil {
			log.Fatal(err)
		}

		_, err = io.Copy(f, bytes.NewBuffer(b))
		if err != nil {
			log.Fatal(err)
		}

		err = f.Close()
		if err != nil {
			log.Fatal(err)
		}
	}
}

type Feature struct {
	feature.Feature
	Dir string `json:"dir"`
}
