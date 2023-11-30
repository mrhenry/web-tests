(function (cb) {
	var style;
	style = window.getComputedStyle(document.querySelector('.foo'));
	if (style.color !== 'lch(46 67.98 134.38)') {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.querySelector('.bar'));
	if (style.color !== 'lab(46 -47.55 48.59)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
