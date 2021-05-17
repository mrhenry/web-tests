(function (cb) {
	var div = document.createElement('DIV');
	div.className = 'foo baz';
	var tokenList = div.classList;

	var results = [];
	for (var token of tokenList) {
		results.push(token);
	}

	if (results.length !== 2) {
		cb(false);
		return;
	}

	cb(results[0] === 'foo' && results[1] === 'baz');
})(callback);
