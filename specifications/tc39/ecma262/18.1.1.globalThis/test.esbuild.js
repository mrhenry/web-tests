(function() {
  // specifications/tc39/ecma262/18.1.1.globalThis/test.pure.js
  (function(cb) {
    cb(typeof globalThis !== "undefined" && typeof globalThis.String !== "undefined");
  })(callback);
})();
