(function (cb) {
	var parts = (new Intl.DateTimeFormat('en', {
 		hourCycle: 'h11',
		hour: 'numeric',
		timeZone: 'UTC'
 	})).formatRangeToParts(43201000 * 4, 43201000 * 5);

 	cb(!!parts && !!parts.length);
})(callback);
