package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/mrhenry/web-tests/scripts/feature"
)

func main() {
	var dirName string
	var id string
	var name string
	var org string
	var section string
	var isPostCSS bool

	flag.BoolVar(&isPostCSS, "postcss", false, "Is a PostCSS test")
	flag.StringVar(&dirName, "dir", "", "Name of the feature dir")
	flag.StringVar(&id, "id", "", "Name of the specification")
	flag.StringVar(&name, "name", "", "Name of the feature (single word)")
	flag.StringVar(&org, "org", "", "Organisation authoring the spec")
	flag.StringVar(&section, "section", "", "Section of the feature (\"6.1.1\" for ecma262 Undefined)")

	flag.Parse()

	if dirName == "" {
		fmt.Println("-dir is required\n\tweb-tests-new-test --help")
		return
	}

	if id == "" {
		fmt.Println("-id is required\n\tweb-tests-new-test --help")
		return
	}

	if name == "" {
		fmt.Println("-name is required\n\tweb-tests-new-test --help")
		return
	}

	if org == "" {
		fmt.Println("-org is required\n\tweb-tests-new-test --help")
		return
	}

	if section == "" {
		fmt.Println("-section is required\n\tweb-tests-new-test --help")
		return
	}

	newFeatureDirPath := filepath.Join("./specifications/", org, id, dirName)
	dir, err := os.Stat(newFeatureDirPath)
	if err == nil {
		if dir.IsDir() {
			log.Fatal("Already exists")
		}
	}

	err = os.MkdirAll(newFeatureDirPath, os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}

	exampleFeatureDirPath := filepath.Join("./specifications/example/test/1.feature")
	if isPostCSS {
		exampleFeatureDirPath = filepath.Join("./specifications/example/test/3.feature-css")
	}

	err = filepath.Walk(exampleFeatureDirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if strings.Contains(path, "results") {
			return filepath.SkipDir
		}

		newPath := strings.Replace(path, exampleFeatureDirPath, newFeatureDirPath, 1)
		if info.IsDir() {
			err = os.MkdirAll(newPath, os.ModePerm)
			if err != nil {
				return err
			}

			return nil
		}

		f1, err := os.Open(path)
		if err != nil {
			return err
		}

		defer f1.Close()

		b, err := ioutil.ReadAll(f1)
		if err != nil {
			return err
		}

		err = f1.Close()
		if err != nil {
			return err
		}

		if strings.HasSuffix(path, "meta.json") {
			meta := feature.Feature{}
			err = json.Unmarshal(b, &meta)
			if err != nil {
				return err
			}

			meta.ID = uuid.NewString()
			meta.Spec.Org = org
			meta.Spec.ID = id
			meta.Spec.Section = section
			meta.Spec.Name = name
			meta.Notes = []struct {
				Message string `json:"message"`
			}{}
			meta.SearchTerms = []string{}

			b, err = json.MarshalIndent(meta, "", "  ")
			if err != nil {
				return err
			}
		}

		f2, err := os.Create(newPath)
		if err != nil {
			return err
		}

		defer f2.Close()

		_, err = io.Copy(f2, bytes.NewBuffer(b))
		if err != nil {
			return err
		}

		err = f2.Close()
		if err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		log.Fatal(err)
	}
}
