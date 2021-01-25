# Web Tests

> Tests for a web eco system.

## What

Testing web features in a way that represents real world usage by web developers.

## Why

There is a blind spot between [WPT](https://github.com/web-platform-tests/wpt), [caniuse](https://caniuse.com), [MDN compatibility](https://github.com/mdn/browser-compat-data), tooling and polyfills. Each part is well tested on its own but only with itself in mind.

None of these can actually guarantee your code will work, and for how many users.

This project aims to eliminate that blind spot.

[Check the results](https://romainmenke.github.io/web-tests/results.html)

## Tested

- native *
- native + polyfill.io
- babel
- babel + polyfill.io
- babel + webpack and core-js
- babel + webpack, core-js and core-web

_suggestions for other tools are welcome_

\* native is refered to as `pure` in files and config as these files will not be modified by tooling.

## How

Web Tests is a chaotic test runner. Each day a random set of browsers is picked in a random order. Each of these will run a random set of tests, again in a random order.

Test failures reduce the score of a feature in a certain browser by `0.01`. Test passes increase the score by `0.02`.
This way we can differentiate between transient errors and real bugs. Tests (or test environments) that are a bit flaky should still score high enough to indicate a working feature.

## Get started

requirements : `make`, `go`, latest `node`

- clone the repo
- run `npm install`
- run `make` to build everything
- run `make scripts` to only build the tools

### Add a new test

run `web-tests-new-test -org="tc39" -id="ecma262" -section="6.1.1" -name="Undefined"`

| arg | usage | examples |
| --- | --- | --- |
| `-org` | the spec body | `tc36`, `whatwg`,... |
| `-id` | the name of the spec | `ecma262`, `dom`, `cssom`,... |
| `-section` | the part of the spec | `6.1.1` |
| `-name` | human readable name | `Undefined` |

This will generate a new test.
Git is helpful to locate what was created.

Each test folder contains a `meta.json` and a `test.pure.js` file that need to customised.

You can also change the folder name if the generated name is to verbose or unclear.

Your actual test goes into `test.pure.js`. All other `test.*.js` files are generated for you.

Each test looks like this :

```js
(function (cb) {
	// TODO : write a test
	cb(true);
})(callback);
```

Each test either passes or fails. No extra debugging information is collected in these tests.

All tests are "async", just call the `callback` function with the `boolean` result when done.

We try to keep tests simple and short.
There is no need to test if a feature works exactly according to the spec. Better to test if something is generally usable.

All tests are also written in ES3. Only the actual feature tested can be modern.

```js
// Testing `async/await`
(async function (cb) {
	// we still use var for ES3.
	var foo = await true;
	cb(foo);
})(callback);
```


## What it's not

This is not a replacement for caniuse. Results from this tool can flow back into caniuse but the principal goal of this project is to test features.
