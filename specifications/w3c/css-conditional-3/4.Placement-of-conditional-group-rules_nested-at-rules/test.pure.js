(function (cb) {
	var style = window.getComputedStyle(document.getElementById('hello'));
	if (style.color !== 'rgb(255, 0, 0)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
