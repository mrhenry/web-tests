.DEFAULT_GOAL := all

web-tests-browserstack: $(wildcard web-tests-browserstack/*) $(wildcard web-tests-browserstack/api/*)
	go install ./web-tests-browserstack/...

web-tests-build-mapping: $(wildcard web-tests-build-mapping/*)
	go install ./web-tests-build-mapping/...

web-tests-build-test: $(wildcard web-tests-build-test/*)
	go install ./web-tests-build-test/...

web-tests-new-test: $(wildcard web-tests-new-test/*)
	go install ./web-tests-new-test/...

web-tests-pages: $(wildcard web-tests-pages/*)
	go install ./web-tests-pages/...

web-tests-migrate-meta: $(wildcard web-tests-migrate-meta/*)
	go install ./web-tests-migrate-meta/...

web-tests-migrate-makefile: $(wildcard web-tests-migrate-makefile/*)
	go install ./web-tests-migrate-makefile/...

all: web-tests-browserstack web-tests-build-mapping web-tests-build-test web-tests-new-test web-tests-pages web-tests-migrate-meta web-tests-migrate-makefile

.PHONY: all web-tests-browserstack web-tests-build-mapping web-tests-build-test web-tests-new-test web-tests-pages web-tests-migrate-meta web-tests-migrate-makefile
