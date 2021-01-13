const browserstackRunner = require("browserstack-runner");
const config = require("./browserstack.json");
const webTests = require('./lib/meta');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

browserstackRunner.run(config, function(error, report) {
	if (!report || !report.length) {
		console.log(error);
		process.exit(1);
	}

	const results = {};

	report.forEach((run) => {
		if (run.tests.length !== 1) {
			// TODO : find out why some runs have multiple entries
			// console.log('expected a single test result for', JSON.stringify(run, null, 2))
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

		// TODO check that "meta" is not null|undefined

		const state = {
			browser: testInfo.runner.browser,
			version: testInfo.runner.version,
			score: firstTest.status === "passed" ? 1 : 0
		}

		const result = results[key] || {
			states: {},
			path: path.join(meta.path, `result.${testInfo.test}.json`)
		};

		result.states[`${testInfo.runner.browser}/${testInfo.runner.version}`] = state ;


		results[key] = result;
	});

	for (const key in results) {
		const result = results[key];

		const existing = fs.existsSync(path.join(__dirname, result.path)) ? JSON.parse(fs.readFileSync(path.join(__dirname, result.path)) || '') : {};
		for (const key in result.states) {
			if (existing[key]) {
				existing[key].score = ((existing[key].score || 1) * 0.99) + (result.states[key].score * 0.01);
			} else {
				existing[key] = result.states[key];
			}

			existing[key].last_run = new Date();
		}

		const sorted = {};
		
		Object.keys(existing).sort((a, b) => {
			// This is not very efficient but good enough for now.
			const aa = existing[a];
			const bb = existing[b];

			if (aa.browser != bb.browser) {
				if (aa.browser < bb.browser) {
					return -1;
				}

				if (aa.browser > bb.browser) {
					return 1;
				}
			}

			const av = semver.coerce(aa.version);
			const bv = semver.coerce(bb.version);
			if (!av || !bv) {
				if (aa.version < bb.version) {
					return -1;
				}

				if (aa.version > bb.version) {
					return 1;
				}

				return 0;
			}

			if (semver.lt(av, bv)) {
				return -1;
			}

			if (semver.gt(av, bv)) {
				return 1;
			}

			return 0;
		}).forEach((x) => {
			sorted[x] = existing[x];
		});

		console.log('write result', path.join(__dirname, result.path));
		fs.writeFileSync(path.join(__dirname, result.path), JSON.stringify(sorted, undefined, "  "));
	}

	if (error) {
		console.log("Error: " + error);
		process.exit(0);
	}

	console.log("Test Finished");
});
