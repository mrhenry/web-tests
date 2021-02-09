(function (cb) {
	var foo = new URL("//foo.com", "https://example.com");
	cb(foo.toString() === "https://foo.com/");
})(callback);
