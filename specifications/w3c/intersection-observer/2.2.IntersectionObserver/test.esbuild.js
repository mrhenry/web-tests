(function() {
  // specifications/w3c/intersection-observer/2.2.IntersectionObserver/test.pure.js
  (function(cb) {
    var foo = new IntersectionObserver(function() {
    }, {});
    cb(!!foo);
  })(callback);
})();
