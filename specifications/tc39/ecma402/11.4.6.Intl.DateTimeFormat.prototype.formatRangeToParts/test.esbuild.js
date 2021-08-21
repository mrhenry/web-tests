(function() {
  // specifications/tc39/ecma402/11.4.6.Intl.DateTimeFormat.prototype.formatRangeToParts/test.pure.js
  (function(cb) {
    var parts = new Intl.DateTimeFormat("en", {
      hourCycle: "h11",
      hour: "numeric",
      timeZone: "UTC"
    }).formatRangeToParts(43201e3 * 4, 43201e3 * 5);
    cb(!!parts && !!parts.length);
  })(callback);
})();
