.DEFAULT_GOAL := all

../lib/mapping.json: $(wildcard ../ecma262/**/*) $(wildcard ../url/**/*) ./build-mapping.js
	@node ./build-mapping.js

../tests/witness: ../lib/mapping.json $(wildcard ../ecma262/**/*) $(wildcard ../url/**/*) ./build-tests.js
	@node ./build-tests.js
	@echo "witness" > ../tests/witness

all: ../tests/witness ../lib/mapping.json

.PHONY: all
