(function() {
  // specifications/tc39/ecma402/11.1.1.24.InitializeDateTimeFormat.options.timeZone/test.pure.js
  (function(cb) {
    var resolvedTimeZone = new Intl.DateTimeFormat("en", {
      timeZone: "Australia/Sydney",
      timeZoneName: "short"
    }).resolvedOptions().timeZone;
    cb(resolvedTimeZone === "Australia/Sydney");
  })(callback);
})();
