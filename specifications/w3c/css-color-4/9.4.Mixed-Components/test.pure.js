(function (cb) {
	var style;
	style = window.getComputedStyle(document.querySelector('.foo'));
	if (style.color !== 'oklch(0.46 0.6798 134.38)') {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.querySelector('.bar'));
	if (style.color !== 'oklab(0.46 -0.4755 0.4859)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
