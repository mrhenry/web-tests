(function (cb) {
  var parts = new Intl.DateTimeFormat('en', {
    hourCycle: 'h11',
    hour: 'numeric'
  }).formatRangeToParts(43201000, 43201000 * 2);
  cb(!!parts && !!parts.length);
})(callback);
