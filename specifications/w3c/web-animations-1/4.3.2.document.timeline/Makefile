.DEFAULT_GOAL := all

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

test.esbuild.js: test.pure.js ../../../../package-lock.json
	npm run esbuild -- $(mkfile_dir)test.pure.js --outfile=$(mkfile_dir)test.esbuild.js --bundle --summary --target=safari5,chrome15,edge12,firefox4 || cp $(mkfile_dir)test.pure.js $(mkfile_dir)test.esbuild.js

html-tests: test.babel.js test.babel_webpack.js test.core-web_modules.js test.core-web_no-modules.js test.esbuild.js
	web-tests-build-test

html-tests-from-existing-sources:
	web-tests-build-test

all: test.babel.js test.babel_webpack.js test.core-web_modules.js test.core-web_no-modules.js test.esbuild.js html-tests

.PHONY: all html-tests html-tests-from-existing-sources
