(function (cb) {
  var range = new Intl.DateTimeFormat('en', {
    hourCycle: 'h11',
    hour: 'numeric',
    timeZone: 'UTC'
  }).formatRangeToParts(43201000 * 4, 43201000 * 5);
  cb(range[0].type === 'hour' && range[0].source === 'startRange' && range[0].value === '0' && range[1].type === 'literal' && range[1].source === 'startRange' && range[1].value === ' ' && range[2].type === 'dayPeriod' && range[2].source === 'startRange' && range[2].value === 'AM' && range[3].type === 'literal' && range[3].source === 'shared' && range[4].type === 'hour' && range[4].source === 'endRange' && range[4].value === '0' && range[5].type === 'literal' && range[5].source === 'endRange' && range[5].value === ' ' && range[6].type === 'dayPeriod' && range[6].source === 'endRange' && range[6].value === 'PM');
})(callback);
