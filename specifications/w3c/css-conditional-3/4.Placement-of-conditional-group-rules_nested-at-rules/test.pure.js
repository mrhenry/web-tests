(function (cb) {
	document.body.offsetTop;

	if ('requestAnimationFrame' in window) {
		requestAnimationFrame(function () {
			var style = window.getComputedStyle(document.getElementById('hello'));
			if (style.color !== 'rgb(255, 0, 0)') {
				cb(false);
				return;
			}

			cb(true);
		});
	} else {
		var style = window.getComputedStyle(document.getElementById('hello'));
		if (style.color !== 'rgb(255, 0, 0)') {
			cb(false);
			return;
		}

		cb(true);
	}
})(callback);
