(function() {
  // specifications/whatwg/url/6.2.constructor.USVString/test.pure.js
  (function(cb) {
    var params = new URLSearchParams("key=730d67");
    cb(params.get("key") === "730d67");
  })(callback);
})();
