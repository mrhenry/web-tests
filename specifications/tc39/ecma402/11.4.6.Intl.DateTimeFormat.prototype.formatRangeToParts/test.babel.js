(function (cb) {
  var parts = new Intl.DateTimeFormat('en', {
    hourCycle: 'h11',
    hour: 'numeric'
  }).formatRangeToParts(1, 43201000);
  cb(!!parts && !!parts.length);
})(callback);
