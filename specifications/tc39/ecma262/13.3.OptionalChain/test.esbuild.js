(function (cb) {
	var foo = {};
	if (foo?.baz?.bar) {
		cb(false);
	} else {
		cb(true);
	}
})(callback);
