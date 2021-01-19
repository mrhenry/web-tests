'use strict';

// const assert = require('assert');
// const { meta, testSources, list } = require('../../lib/meta');

// testMeta();
// testList();
// testTestSources();

// function testMeta() {
// 	try {
// 		assert.deepStrictEqual(meta('ecma262', '6.1.1'), {
// 			"path": "ecma262/6.1.1.Undefined",
// 			"spec": {
// 				"org": "tc39",
// 				"id": "ecma262",
// 				"section": "6.1.1",
// 				"name": "The Undefined Type",
// 				"url": "https://tc39.es/ecma262/#sec-ecmascript-language-types-undefined-type"
// 			},
// 			"tests": {
// 				"pure": "test.pure.js",
// 				"babel": "test.babel.js",
// 				"babel_webpack": "test.babel_webpack.js"
// 			}
// 		});
// 	} catch (err) {
// 		console.log(err.message);
// 		process.exit(1);	
// 	}
// }

// function testTestSources() {
// 	try {
// 		const sources = testSources('ecma262', '6.1.1');
// 		assert.ok(sources);
// 		assert.ok(sources.pure);
// 		assert.ok(sources.babel);
// 	} catch (err) {
// 		console.log(err.message);
// 		process.exit(1);	
// 	}
// }

// function testList() {
// 	try {
// 		const testList = list('ecma262');
// 		assert.ok(testList);
// 		assert.ok(testList.length);
// 		assert.equal(testList[0].spec.org, 'tc39');
// 	} catch (err) {
// 		console.log(err.message);
// 		process.exit(1);	
// 	}
// }
