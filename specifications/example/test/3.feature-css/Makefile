.DEFAULT_GOAL := all

mkfile_dir := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

test.postcss-preset-env.css: test.pure.css ../../../../postcss.config.js ../../../../package-lock.json
	npm run postcss -- $(mkfile_dir)test.pure.css --output $(mkfile_dir)test.postcss-preset-env.css

html-tests: test.postcss-preset-env.css test.pure.html test.pure.js
	web-tests-build-test

html-tests-from-existing-sources:
	web-tests-build-test

all: test.postcss-preset-env.css html-tests

.PHONY: all html-tests html-tests-from-existing-sources
