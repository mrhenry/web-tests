(function() {
  // specifications/w3c/geometry-1/3.DOMRect.fromRect/test.pure.js
  (function(cb) {
    var domRect = DOMRect.fromRect(new DOMRect());
    cb(!!domRect);
  })(callback);
})();
