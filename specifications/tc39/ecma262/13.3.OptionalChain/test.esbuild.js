(function() {
  // specifications/tc39/ecma262/13.3.OptionalChain/test.pure.js
  (function(cb) {
    var _a;
    var foo = {};
    if ((_a = foo == null ? void 0 : foo.baz) == null ? void 0 : _a.bar) {
      cb(false);
    } else {
      cb(true);
    }
  })(callback);
})();
