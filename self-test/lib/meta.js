'use strict';

const assert = require('assert');
const { getMetaBySection, list } = require('../../lib/meta');

testGetMetaBySection();
testList();

function testGetMetaBySection() {
	try {
		assert.deepStrictEqual(getMetaBySection('ecma262', '6.1.1'), {
			"spec": {
				"org": "tc39",
				"id": "ecma262",
				"section": "6.1.1",
				"name": "The Undefined Type",
				"url": "https://tc39.es/ecma262/#sec-ecmascript-language-types-undefined-type"
			},
			"tests": {
				"pure": "test.js",
				"babel": "test.babel.js",
				"issues": []
			}
		});
	} catch (err) {
		console.log(err.message);
		process.exit(1);	
	}
}

function testList() {
	try {
		const testList = list('ecma262');
		assert.ok(testList);
		assert.ok(testList.length);
		assert.equal(testList[0].spec.org, 'tc39');
	} catch (err) {
		console.log(err.message);
		process.exit(1);	
	}
}
