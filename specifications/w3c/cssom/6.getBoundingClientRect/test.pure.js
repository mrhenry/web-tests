(function (cb) {
	var el = document.getElementById("the-fixture--positioned");
	var rect = DOMRect.fromRect(el.getBoundingClientRect());
	cb(
		"top" in rect &&
		"left" in rect &&
		"x" in rect &&
		"y" in rect &&
		"width" in rect &&
		"height" in rect &&
		rect.top > 0 &&
		rect.left > 0 &&
		rect.x > 0 &&
		rect.y > 0 &&
		rect.width > 0 &&
		rect.height > 0
	);
})(callback);
