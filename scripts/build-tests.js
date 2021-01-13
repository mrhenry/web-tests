const fs = require('fs');
const path = require('path');
const webTests = require('../lib/meta');

function build() {
	webTests.list('ecma262').forEach((item) => {
		const testSources = webTests.testSources('ecma262', item.spec.section);

		for (const testName in testSources) {
			fs.writeFileSync(
				path.join(
					__dirname,
					'../tests',
					`ecma262-${item.spec.section}-${testName}.html`
				),
				testTemplateHTML(
					testName,
					item,
					testSources,
				)
			);
		}
	});

	webTests.list('url').forEach((item) => {
		const testSources = webTests.testSources('url', item.spec.section);

		for (const testName in testSources) {
			fs.writeFileSync(
				path.join(
					__dirname,
					'../tests',
					`url-${item.spec.section}-${testName}.html`
				),
				testTemplateHTML(
					testName,
					item,
					testSources,
				)
			);
		}
	});
	
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
			}),
			...webTests.list('url').flatMap((item) => {
				const out = [];
				for (const testName in item.tests) {
					out.push(`tests/url-${item.spec.section}-${testName}.html`);
				}

				return out;
			})
		],
		"test_server_port": "8899",
		"browsers": shuffle(JSON.parse(fs.readFileSync(path.join(__dirname, './browsers.json')))).slice(0, 10)
	}, undefined, "  "));
}

build();
console.log('updated tests/*');

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function testTemplateHTML(testName, item, testSources) {
	return `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width" />
	<title>${item.spec.name} | ${testName} | ${item.spec.id}</title>
	<link rel="stylesheet" href="/qunit/qunit-2.9.2.css" />
</head>
<body>
	<div id="qunit"></div>
	<div id="qunit-fixture"></div>
	<script src="/qunit/qunit-2.9.2.js"></script>
	<script>
		QUnit.test('${JSON.stringify({ spec: { id: item.spec.id, section: item.spec.section }, test: testName })}', function(assert) {
			var done = assert.async();
			function callback(result) {
				assert.ok(result);
				done();
			}

			;${testSources[testName]};
		});
	</script>
</body>
</html>
`;
}
