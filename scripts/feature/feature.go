package feature

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path"
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
	SearchTerms []string `json:"search_terms"`
	Tests       map[string]struct {
		InlineScript    string `json:"inline_script,omitempty"`
		ModuleScript    string `json:"module_script,omitempty"`
		NoModulesScript string `json:"nomodules_script,omitempty"`
		HasPolyfillIO   bool   `json:"has_polyfillio,omitempty"`
	} `json:"tests"`
	PolyfillIO []string `json:"polyfill.io"`
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

func (x FeatureInMapping) ContentHashForTest(test string) (string, error) {
	if x.Dir == "" {
		return "", errors.New("feature has no directory")
	}

	var dirB []byte

	if x.Tests[test].HasPolyfillIO {
		for _, polyfill := range x.PolyfillIO {
			dirB = append(dirB, polyfill...)
		}
	}

	if x.Tests[test].InlineScript != "" {
		testPath := path.Join(x.Dir, x.Tests[test].InlineScript)

		f, err := os.Open(testPath)
		if err != nil {
			return "", err
		}

		defer f.Close()

		b, err := ioutil.ReadAll(f)
		if err != nil {
			return "", err
		}

		dirB = append(dirB, testPath...)
		dirB = append(dirB, b...)
	}

	if x.Tests[test].ModuleScript != "" {
		testPath := path.Join(x.Dir, x.Tests[test].ModuleScript)

		f, err := os.Open(testPath)
		if err != nil {
			return "", err
		}

		defer f.Close()

		b, err := ioutil.ReadAll(f)
		if err != nil {
			return "", err
		}

		dirB = append(dirB, testPath...)
		dirB = append(dirB, b...)
	}

	if x.Tests[test].NoModulesScript != "" {
		testPath := path.Join(x.Dir, x.Tests[test].NoModulesScript)

		f, err := os.Open(testPath)
		if err != nil {
			return "", err
		}

		defer f.Close()

		b, err := ioutil.ReadAll(f)
		if err != nil {
			return "", err
		}

		dirB = append(dirB, testPath...)
		dirB = append(dirB, b...)
	}

	sum := sha256.Sum256(dirB)
	return fmt.Sprintf("%x", sum), nil
}

type Mapping map[string]FeatureInMapping
