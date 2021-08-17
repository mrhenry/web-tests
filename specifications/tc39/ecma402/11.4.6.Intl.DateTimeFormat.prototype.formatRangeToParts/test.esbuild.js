(function() {
  // specifications/tc39/ecma402/11.4.6.Intl.DateTimeFormat.prototype.formatRangeToParts/test.pure.js
  (function(cb) {
    var parts = new Intl.DateTimeFormat("en", {
      hourCycle: "h11",
      hour: "numeric"
    }).formatRangeToParts(43201e3, 43201e3 * 2);
    cb(!!parts && !!parts.length);
  })(callback);
})();
