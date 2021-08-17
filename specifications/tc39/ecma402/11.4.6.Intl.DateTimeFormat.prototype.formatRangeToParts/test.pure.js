(function (cb) {
	var range = (new Intl.DateTimeFormat('en', {
		hourCycle: 'h11',
		hour: 'numeric'
	})).formatRangeToParts(1, 43201000);

	cb(range[2].type === 'dayPeriod');
})(callback);
