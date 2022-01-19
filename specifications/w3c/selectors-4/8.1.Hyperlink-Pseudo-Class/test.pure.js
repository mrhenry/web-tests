(function (cb) {
	var aStyle = window.getComputedStyle(document.getElementById('a'));
	if (aStyle.color !== 'rgb(255, 0, 0)') {
		cb(false);
		return;
	}

	var bStyle = window.getComputedStyle(document.getElementById('b'));
	if (bStyle.color !== 'rgb(255, 0, 0)') {
		cb(false);
		return;
	}

	// No href, so not rgb(255, 0, 0)
	var cStyle = window.getComputedStyle(document.getElementById('c'));
	if (cStyle.color === 'rgb(255, 0, 0)') {
		cb(false);
		return;
	}

	var dStyle = window.getComputedStyle(document.getElementById('d'));
	if (dStyle.color !== 'rgb(255, 0, 0)') {
		cb(false);
		return;
	}

	cb(true);
})(callback);
