.DEFAULT_GOAL := all

mkfile_dir := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

html-tests: test.pure.html test.pure.js
	web-tests-build-test

html-tests-from-existing-sources:
	web-tests-build-test

all: html-tests

.PHONY: all html-tests html-tests-from-existing-sources
