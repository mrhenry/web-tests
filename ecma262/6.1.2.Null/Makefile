.DEFAULT_GOAL := all

mkfile_dir := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

test.babel.js: test.pure.js ../../babel.config.json ../../package-lock.json
	npm run babel -- $(mkfile_dir)test.pure.js --out-file $(mkfile_dir)test.babel.js

test.babel_webpack.js: test.pure.js ../../webpack.config.js ../../package-lock.json
	npm run webpack -- --entry $(mkfile_dir)test.pure.js --output-path $(mkfile_dir)

all: test.babel.js test.babel_webpack.js

.PHONY: all
