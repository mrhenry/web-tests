package feature

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

type Feature struct {
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
	SearchTerms []string          `json:"search_terms"`
	Tests       map[string]string `json:"tests"`
	PolyfillIO  []string          `json:"polyfill.io"`
}

type FeatureInMapping struct {
	Feature
	Dir string `json:"dir"`
}

func (x FeatureInMapping) ContentHash() (string, error) {
	if x.Dir == "" {
		return "", errors.New("feature has no directory")
	}

	var dirB []byte

	err := filepath.Walk(x.Dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return filepath.SkipDir
		}

		f, err := os.Open(path)
		if err != nil {
			return err
		}

		defer f.Close()

		b, err := ioutil.ReadAll(f)
		if err != nil {
			return err
		}

		dirB = append(dirB, []byte(path)...)
		dirB = append(dirB, b...)

		return nil
	})
	if err != nil {
		return "", err
	}

	sum := sha256.Sum256(dirB)
	return fmt.Sprintf("%x", sum), nil
}

type Mapping map[string]FeatureInMapping
