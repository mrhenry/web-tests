(function (cb) {
	var style1 = window.getComputedStyle(document.getElementById('a-rect-1'));
	if (style1.fill !== 'rgb(255, 0, 0)') {
		cb(false);
		return;
	}

	var style2 = window.getComputedStyle(document.getElementById('a-rect-2'));
	if (style2.fill !== 'rgb(255, 0, 0)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
