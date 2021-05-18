(function (cb) {
	var nodeList = document.querySelectorAll('div');

	var results = [];
	for (var node of nodeList) {
		results.push(node);
	}

	cb(results.length > 0);
})(callback);
