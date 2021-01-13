const mapping = require('./mapping.json');
const fs = require('fs');
const path = require('path');

module.exports = {
	list: list,
	meta: meta,
	testSources:testSources,
}

function meta(spec, section) {
	if (spec === "ecma262") {
		const index = mapping.ecma262.bySection[section];
		if (typeof index !== 'number') {
			return;
		}

		return mapping.ecma262.items[index];
	}
	
	if (spec === "url") {
		const index = mapping.url.bySection[section];
		if (typeof index !== 'number') {
			return;
		}

		return mapping.url.items[index];
		
	}

	return;
}

function testSources(spec, section) {
	if (spec === "ecma262") {
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
	}

	if (spec === "url") {
		const index = mapping.url.bySection[section];
		if (typeof index !== 'number') {
			return;
		}

		const meta = mapping.url.items[index];
		const testSources = {};
		for (const key in meta.tests) {
			const testSource = fs.readFileSync(path.join(__dirname, '../', meta.path, meta.tests[key])).toString();
			testSources[key] = testSource;
		}

		return testSources;
	}

	return;
}

function list(spec) {
	if (spec === "ecma262") {
		return mapping.ecma262.items;
	}

	if (spec === "url") {
		return mapping.url.items;
	}

	return;
}
