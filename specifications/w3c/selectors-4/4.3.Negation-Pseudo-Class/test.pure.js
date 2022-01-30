(function (cb) {
	var blue = "rgb(0, 0, 255)";
	var green = "rgb(0, 128, 0)";
	var red = "rgb(255, 0, 0)";
	var yellow = "rgb(255, 255, 0)";
	var white = "rgb(255, 255, 255)";
	
	var style;
	style = window.getComputedStyle(document.querySelector('.b'));
	if (style.color !== green) {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.querySelector('.c'));
	if (style.color !== yellow) {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.querySelector('.d'));
	if (style.color !== yellow) {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.getElementById('e'));
	if (style.color !== red) {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.getElementById('f'));
	if (style.color !== blue) {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.getElementById('i'));
	if (style.color !== white) {
		cb(false);
		return;
	}

	cb(true);
})(callback);
