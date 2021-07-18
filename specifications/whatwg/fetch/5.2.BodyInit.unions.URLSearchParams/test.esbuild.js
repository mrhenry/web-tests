(function() {
  // specifications/whatwg/fetch/5.2.BodyInit.unions.URLSearchParams/test.pure.js
  (function(cb) {
    new Request("#", { body: new URLSearchParams({ foo: "baz" }), method: "POST" }).text().then(function(x) {
      cb(x === "foo=baz");
    });
  })(callback);
})();
