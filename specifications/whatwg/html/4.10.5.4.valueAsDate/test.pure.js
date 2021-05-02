(function (cb) {
	try {
		var inputA = document.createElement('input');
		inputA.setAttribute('type', 'date');
		inputA.valueAsDate = new Date();
	} catch (_) {
		cb(false);
		return;
	}

	var inputB = document.createElement('input');
	inputB.setAttribute('type', 'date');
	inputB.value = "2006-01-02";
	var valueAsDate = inputB.valueAsDate;

	cb("undefined" !== typeof valueAsDate);
})(callback);
