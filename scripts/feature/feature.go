package feature

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"regexp"
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
		InlineCSS       string `json:"inline_css,omitempty"`
		InlineHTML      string `json:"inline_html,omitempty"`
		InlineScript    string `json:"inline_script,omitempty"`
		ModuleScript    string `json:"module_script,omitempty"`
		NoModulesScript string `json:"nomodules_script,omitempty"`
	} `json:"tests"`
}

type FeatureInMapping struct {
	Feature
	Dir string `json:"dir"`
}

var corejsVersioningRegexp = regexp.MustCompile(`\s*version: '\d+\.\d+\.\d+',
\s*mode: IS_PURE \? 'pure' : 'global',
\s*copyright: '© \d+-\d+ Denis Pushkarev \(zloirock\.ru\)',
\s*license: 'https://github\.com/zloirock/core-js/blob/v\d+\.\d+\.\d+/LICENSE',`)

func (x FeatureInMapping) ContentHashForTest(test string) (string, error) {
	if x.Dir == "" {
		return "", errors.New("feature has no directory")
	}

	var dirB []byte

	if x.Tests[test].InlineCSS != "" {
		testPath := path.Join(x.Dir, x.Tests[test].InlineCSS)

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

	if x.Tests[test].InlineHTML != "" {
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

	dirB = corejsVersioningRegexp.ReplaceAll(dirB, []byte{})

	sum := sha256.Sum256(dirB)
	return fmt.Sprintf("%x", sum), nil
}

type Mapping map[string]FeatureInMapping
