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
)

func main() {
	featureDirs := []string{}
	features := map[string]map[string]map[string]interface{}{}

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

		item := map[string]interface{}{}
		err = json.Unmarshal(b, &item)
		if err != nil {
			log.Fatal(err)
		}
		item["dir"] = featureDir

		type metaType struct {
			Spec struct {
				Org     string `json:"org"`
				ID      string `json:"id"`
				Section string `json:"section"`
			} `json:"spec"`
		}

		meta := metaType{}
		err = json.Unmarshal(b, &meta)
		if err != nil {
			log.Fatal(err)
		}

		org, ok := features[meta.Spec.Org]
		if !ok {
			org = map[string]map[string]interface{}{}
		}

		spec, ok := org[meta.Spec.ID]
		if !ok {
			spec = map[string]interface{}{}
		}

		spec[meta.Spec.Section] = item
		org[meta.Spec.ID] = spec
		features[meta.Spec.Org] = org
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
