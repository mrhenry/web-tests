(function (cb) {
	const foo = "foo";

	try {
		foo = 5;
		cb(false);
	} catch (_) {
		cb(foo === "foo");
	}
})(callback);
