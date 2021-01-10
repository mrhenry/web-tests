const mapping = require('./mapping.json');
const fs = require('fs');
const path = require('path');

module.exports = {
	list: list,
	meta: meta,
	testSources:testSources,
}

function meta(spec, section) {
	switch (spec) {
		case "ecma262":
			const index = mapping.ecma262.bySection[section];
			if (typeof index !== 'number') {
				return;
			}

			return mapping.ecma262.items[index];
	
		default:
			return;
	}
}

function testSources(spec, section) {
	switch (spec) {
		case "ecma262":
			const index = mapping.ecma262.bySection[section];
			if (typeof index !== 'number') {
				return;
			}

			const meta = mapping.ecma262.items[index];
			const testSources = {};
			for (const key in meta.tests) {
				const testSource = fs.readFileSync(path.join(__dirname, '../', meta.path, meta.tests[key])).toString();
				testSources[key] = testSource;
			}

			return testSources;
	
		default:
			return;
	}
}

function list(spec) {
	switch (spec) {
		case "ecma262":
			return mapping.ecma262.items;
	
		default:
			return;
	}
}
