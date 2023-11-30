(function (cb) {
	var style;
	style = window.getComputedStyle(document.querySelector('.foo'));
	if (style.color !== 'color(display-p3 0.18 0.7 0.05)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
