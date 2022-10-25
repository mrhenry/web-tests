(function (cb) {
	setTimeout(function() {
		var style = window.getComputedStyle(document.getElementById('hello'));
		console.log(style.color);
		if (style.color !== 'rgb(255, 0, 0)') {
			cb(false);
			return;
		}

		cb(true);
	}, 200);
})(callback);
