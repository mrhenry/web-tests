(function (cb) {
	// Notes:
	// - Edge serializes colors differently

	var style1 = window.getComputedStyle(document.getElementById('a-rect-1'));
	if (style1.fill !== 'rgb(255, 0, 0)' && style1.fill !== 'red') {
		cb(false);
		return;
	}

	var style2 = window.getComputedStyle(document.getElementById('a-rect-2'));
	if (style2.fill !== 'rgb(255, 0, 0)' && style2.fill !== 'red') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
