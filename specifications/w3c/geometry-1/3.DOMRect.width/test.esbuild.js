(function() {
  // specifications/w3c/geometry-1/3.DOMRect.width/test.pure.js
  (function(cb) {
    var domRect = new DOMRect();
    cb(typeof domRect.width !== "undefined");
  })(callback);
})();
