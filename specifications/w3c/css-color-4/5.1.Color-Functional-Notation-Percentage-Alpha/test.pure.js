(function (cb) {
	var green = "rgb(0, 128, 0)";
	
	var style;
	style = window.getComputedStyle(document.querySelector('.foo'));
	if (style.color !== green) {
		cb(false);
		return;
	}

	cb(true);
})(callback);
