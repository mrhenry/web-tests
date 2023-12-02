(function (cb) {
	var style;
	style = window.getComputedStyle(document.querySelector('.foo'));
	if (style.color !== 'lch(46 10 134.38)') {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.querySelector('.bar'));
	if (style.color !== 'lab(46 -10 25)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
