(function() {
  // specifications/tc39/ecma262/13.2.5.1.ArrayInitialiser.Elision/test.pure.js
  (function(cb) {
    var arr = ["a", "b", "c", , ,];
    var res = [];
    arr.forEach(function(el) {
      res.push(el);
    });
    cb(arr.length === 5 && res.length === 3);
  })(callback);
})();
