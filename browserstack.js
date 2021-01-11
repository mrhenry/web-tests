const browserstackRunner = require("browserstack-runner");
const config = require("./browserstack.json");
const webTests = require('./lib/meta');
const fs = require('fs');
const path = require('path');

browserstackRunner.run(config, function(error, report) {
	const results = {};

	try {
		report.forEach((run) => {
			try {
				if (run.tests.length !== 1) {
					console.log('expected a single test result for', JSON.stringify(run, null, 2))
				}

				const testInfo = (() => {
					const out = {};
					const parts = run.browser.split(',').map((x) => {
						return x.trim();
					});

					const browserParts = parts[1].split(' ');

					const runner = {
						browser: browserParts.slice(0, -1).join(' '),
						version: browserParts.slice(-1).join(' ')
					}

					out.runner = runner;

					// TODO : this should be regexp
					const featureParts = parts[2].replace('tests/', '').replace('.html', '').split('-');

					const spec = {
						id: featureParts[0],
						section: featureParts[1]
					}

					out.spec = spec;
					out.test = featureParts[2];

					return out;
				})();

				const key = JSON.stringify({
					id: testInfo.spec.id,
					section: testInfo.spec.section,
					test: testInfo.test
				});

				const firstTest = run.tests[0];
				const meta = webTests.meta(testInfo.spec.id, testInfo.spec.section);
		
				const state = {
					browser: testInfo.runner.browser,
					version: testInfo.runner.version,
					passed: firstTest.status === "passed"
				}

				const result = results[key] || {
					states: [],
					path: path.join(meta.path, `result.${testInfo.test}.json`)
				};

				result.states.push(state);


				results[key] = result;
			} catch (errInner) {
				console.log("Error: " + errInner);
			}
		});

		for (const key in results) {
			const result = results[key];

			console.log('write result', path.join(__dirname, result.path));
			fs.writeFileSync(path.join(__dirname, result.path), JSON.stringify(result.states, undefined, "  "));
		}
	} catch (err) {
		console.log("Error: " + err);
		process.exit(1);
	}

	if (error) {
		console.log("Error: " + error);
		process.exit(1);
	}

	console.log("Test Finished");
});
