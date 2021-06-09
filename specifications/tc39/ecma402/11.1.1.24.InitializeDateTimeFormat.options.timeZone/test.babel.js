(function (cb) {
  var resolvedTimeZone = new Intl.DateTimeFormat('en', {
    timeZone: 'Africa/Dakar',
    timeZoneName: 'short'
  }).resolvedOptions().timeZone;
  cb(resolvedTimeZone === 'Africa/Dakar');
})(callback);
