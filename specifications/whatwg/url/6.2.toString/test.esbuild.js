(function() {
  // specifications/whatwg/url/6.2.toString/test.pure.js
  (function(cb) {
    var params = new URLSearchParams();
    params.set("key", "730d67");
    cb(params.toString() === "key=730d67");
  })(callback);
})();
