(function() {
  // specifications/tc39/ecma262/6.1.4.String/test.pure.js
  (function(cb) {
    var foo = "foo";
    cb(typeof foo === "string" && foo[0] === "f");
  })(callback);
})();
