(function (cb) {
	new Request('#', { body: new URLSearchParams({ foo: 'baz' }), method: 'POST' }).text().then(function(x) {
		cb(x === 'foo=baz');
	});
})(callback);
