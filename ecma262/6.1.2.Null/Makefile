mkfile_dir := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

test.babel.js: test.pure.js ../../babel.config.json ../../package-lock.json
	npm run babel -- $(mkfile_dir)test.pure.js --out-file $(mkfile_dir)test.babel.js
