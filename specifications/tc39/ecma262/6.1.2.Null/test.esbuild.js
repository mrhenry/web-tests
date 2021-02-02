(function() {
  // specifications/tc39/ecma262/6.1.2.Null/test.pure.js
  (function(cb) {
    var foo = null;
    cb(!foo && typeof foo !== "undefined");
  })(callback);
})();
