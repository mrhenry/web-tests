(function() {
  // specifications/whatwg/url/6.1.2.constructor.base/test.pure.js
  (function(cb) {
    var foo = new URL("//foo.com", "https://example.com");
    cb(foo.toString() === "https://foo.com/");
  })(callback);
})();
