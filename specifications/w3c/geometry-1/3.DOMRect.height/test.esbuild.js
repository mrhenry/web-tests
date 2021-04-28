(function() {
  // specifications/w3c/geometry-1/3.DOMRect.height/test.pure.js
  (function(cb) {
    var domRect = new DOMRect();
    cb(typeof domRect.height !== "undefined");
  })(callback);
})();
