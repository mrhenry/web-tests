.DEFAULT_GOAL := all

mkfile_dir := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

test.babel.js: test.pure.js ../../../../babel.config.json ../../../../package-lock.json
	npm run babel -- $(mkfile_dir)test.pure.js --out-file $(mkfile_dir)test.babel.js

html_tests: test.babel.js
	web-tests-build-test

all: test.babel.js html_tests

.PHONY: all html_tests
