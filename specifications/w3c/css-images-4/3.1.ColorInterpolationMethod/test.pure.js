(function (cb) {
	var style = window.getComputedStyle(document.getElementById('hello'));
	if (style.background === 'rgb(255, 0, 0)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
