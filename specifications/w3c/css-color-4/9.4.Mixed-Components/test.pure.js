(function (cb) {
	var style;
	style = window.getComputedStyle(document.querySelector('.foo'));
	if (style.color !== 'oklch(0.8 0.1 134.38)') {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.querySelector('.bar'));
	if (style.color !== 'oklab(0.8 -0.1 0.08)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
