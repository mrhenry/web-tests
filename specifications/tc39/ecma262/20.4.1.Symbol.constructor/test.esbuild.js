(function (cb) {
	var foo = Symbol('foo');
	cb(!!foo);
})(callback);
