(function() {
  // specifications/whatwg/url/6.2.constructor.Sequence/test.pure.js
  (function(cb) {
    var params = new URLSearchParams([["foo", "1"], ["bar", "2"]]);
    cb(params.get("foo") === "1" && params.get("bar") === "2");
  })(callback);
})();
