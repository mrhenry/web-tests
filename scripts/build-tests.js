const fs = require('fs');
const path = require('path');
const webTests = require('../lib/meta');

function build() {
	webTests.list('ecma262').forEach((item) => {
		const testSources = webTests.testSources('ecma262', item.spec.section);

		for (const testName in testSources) {
			fs.writeFileSync(path.join(__dirname, '../tests', `ecma262-${item.spec.section}-${testName}.html`), `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />
	<title>${ item.spec.name } | ${testName} | ecma262</title>
	<link rel="stylesheet" href="/qunit/qunit-2.9.2.css" />
</head>
<body>
	<div id="qunit"></div>
	<div id="qunit-fixture"></div>
	<script src="/qunit/qunit-2.9.2.js"></script>
	<script>
		QUnit.test('${ item.spec.name} (${testName})', function(assert) {
			;var result = ${testSources[testName]}
			;assert.ok(result);
		});
	</script>
</body>
</html>
`)
		}
	})
	
	fs.writeFileSync(path.join(__dirname, '../', 'browserstack.json'), JSON.stringify({
		"exit_with_fail": true,
		"test_framework": "qunit",
		"test_path": [
			...webTests.list('ecma262').flatMap((item) => {
				const out = [];
				for (const testName in item.tests) {
					out.push(`tests/ecma262-${item.spec.section}-${testName}.html`);
				}

				return out;
			})
		],
		"test_server_port": "8899",
		"browsers": [
			"ie_11",
			"safari_8",
			"safari_12.1",
			"chrome_41",
			"chrome_43",
			"chrome_44",
			"chrome_55",
			"chrome_56",
			"chrome_57",
			"chrome_63",
			"chrome_64",
			"chrome_65",
			"chrome_73",
			"chrome_79",
			"safari_latest",
			"chrome_latest",
			"opera_latest",
			"firefox_latest",
			"edge_17",
			"edge_18"
		]
	}, undefined, "  "));
}

build();
console.log('updated tests/*');
