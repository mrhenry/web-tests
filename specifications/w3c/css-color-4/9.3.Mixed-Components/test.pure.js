(function (cb) {
	var style;
	style = window.getComputedStyle(document.querySelector('.foo'));
	if (style.color !== 'lch(46 40 134.38)') {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.querySelector('.bar'));
	if (style.color !== 'lab(46 -40 50)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
