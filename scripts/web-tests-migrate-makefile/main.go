package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	makefileDirs := []string{}

	err := filepath.Walk("./specifications", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if strings.HasSuffix(path, "Makefile") {
			makefileDirs = append(makefileDirs, filepath.Dir(path))
		}

		return nil
	})
	if err != nil {
		log.Fatal(err)
	}

	for _, makefileDir := range makefileDirs {
		func(dir string) {
			{
				f, err := os.Create(filepath.Join(dir, "Makefile"))
				if err != nil {
					log.Fatal(err)
				}

				defer f.Close()

				f.WriteString(makefileTemplate)

				err = f.Close()
				if err != nil {
					log.Fatal(err)
				}
			}
		}(makefileDir)
	}
}

const makefileTemplate = `.DEFAULT_GOAL := all

mkfile_dir := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

test.babel.js: test.pure.js ../../../../babel.config.json ../../../../package-lock.json
	npm run babel -- $(mkfile_dir)test.pure.js --out-file $(mkfile_dir)test.babel.js

test.babel_webpack.js: test.pure.js ../../../../webpack.config.js ../../../../package-lock.json
	npm run webpack -- --entry $(mkfile_dir)test.pure.js --output-path $(mkfile_dir) --config webpack.config.js
	@touch test.babel_webpack.js

test.core-web_modules.js test.core-web_no-modules.js: test.pure.js ../../../../webpack-core-web.config.js ../../../../package-lock.json
	npm run webpack -- --entry $(mkfile_dir)test.pure.js --output-path $(mkfile_dir) --config webpack-core-web.config.js
	@touch test.core-web_modules.js
	@touch test.core-web_no-modules.js

html_tests: test.babel.js test.babel_webpack.js test.core-web_modules.js test.core-web_no-modules.js
	web-tests-build-test

all: test.babel.js test.babel_webpack.js test.core-web_modules.js test.core-web_no-modules.js html_tests

.PHONY: all html_tests
`
