.DEFAULT_GOAL := all

web-tests-browserstack: $(wildcard web-tests-browserstack/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-browserstack/...

web-tests-browserstack-single: $(wildcard web-tests-browserstack-single/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-browserstack-single/...

web-tests-build-mapping: $(wildcard web-tests-build-mapping/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-build-mapping/...

web-tests-build-test: $(wildcard web-tests-build-test/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-build-test/...

web-tests-new-test: $(wildcard web-tests-new-test/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-new-test/...

web-tests-pages: $(wildcard web-tests-pages/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-pages/...

web-tests-migrate-meta: $(wildcard web-tests-migrate-meta/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-migrate-meta/...

web-tests-migrate-makefile: $(wildcard web-tests-migrate-makefile/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-migrate-makefile/...

web-tests-collect-ua-strings: $(wildcard web-tests-collect-ua-strings/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-collect-ua-strings/...

web-tests-native-support-data: $(wildcard web-tests-native-support-data/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-native-support-data/...

web-tests-passes: $(wildcard web-tests-passes/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-passes/...

web-tests-reset-priority: $(wildcard web-tests-reset-priority/*) $(wildcard browserstack/*) $(wildcard browserua/*) $(wildcard feature/*) $(wildcard priority/*) $(wildcard result/*) $(wildcard store/*)
	go install ./web-tests-reset-priority/...

all: web-tests-browserstack web-tests-browserstack-single web-tests-build-mapping web-tests-build-test web-tests-new-test web-tests-pages web-tests-migrate-meta web-tests-migrate-makefile web-tests-collect-ua-strings web-tests-passes web-tests-native-support-data web-tests-reset-priority

.PHONY: all web-tests-browserstack web-tests-browserstack-single web-tests-build-mapping web-tests-build-test web-tests-new-test web-tests-pages web-tests-migrate-meta web-tests-migrate-makefile web-tests-collect-ua-strings web-tests-passes web-tests-native-support-data web-tests-reset-priority
