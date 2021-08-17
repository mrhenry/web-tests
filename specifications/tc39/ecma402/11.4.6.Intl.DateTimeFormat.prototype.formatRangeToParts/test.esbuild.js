(function() {
  // specifications/tc39/ecma402/11.4.6.Intl.DateTimeFormat.prototype.formatRangeToParts/test.pure.js
  (function(cb) {
    var range = new Intl.DateTimeFormat("en", {
      hourCycle: "h11",
      hour: "numeric"
    }).formatRangeToParts(1, 43201e3);
    cb(range[0].type === "hour" && range[0].source === "startRange" && range[0].value === "1" && range[1].type === "literal" && range[1].source === "startRange" && range[1].value === " " && range[2].type === "dayPeriod" && range[2].source === "startRange" && range[2].value === "AM" && range[3].type === "literal" && range[3].source === "shared" && range[4].type === "hour" && range[4].source === "endRange" && range[4].value === "1" && range[5].type === "literal" && range[5].source === "endRange" && range[5].value === " " && range[6].type === "dayPeriod" && range[6].source === "endRange" && range[6].value === "PM");
  })(callback);
})();
