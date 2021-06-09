(function() {
  // specifications/tc39/ecma402/11.1.1.24.InitializeDateTimeFormat.options.timeZone/test.pure.js
  (function(cb) {
    var resolvedTimeZone = new Intl.DateTimeFormat("en", {
      timeZone: "Africa/Dakar",
      timeZoneName: "short"
    }).resolvedOptions().timeZone;
    cb(resolvedTimeZone === "Africa/Dakar");
  })(callback);
})();
