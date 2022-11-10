(function (cb) {
	var style = window.getComputedStyle(document.getElementById('a'));
	if (style.color !== 'rgb(0, 255, 0)') {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.getElementById('b'));
	if (style.color !== 'rgb(0, 255, 0)') {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.getElementById('c'));
	if (style.color !== 'rgb(0, 255, 0)') {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.getElementById('d'));
	if (style.color !== 'rgb(0, 255, 0)') {
		cb(false);
		return;
	}

	style = window.getComputedStyle(document.getElementById('e'));
	if (style.color !== 'rgb(0, 255, 0)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
