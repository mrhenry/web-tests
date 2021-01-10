mkfile_dir := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

test.babel.js: test.js ../../babel.config.json ../../package-lock.json
	npm run babel -- $(mkfile_dir)test.js --out-file $(mkfile_dir)test.babel.js
