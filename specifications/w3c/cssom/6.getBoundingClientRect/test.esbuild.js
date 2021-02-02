(function() {
  // specifications/w3c/cssom/6.getBoundingClientRect/test.pure.js
  (function(cb) {
    var el = document.getElementById("the-fixture--positioned");
    var clientBoundingRect = el.getBoundingClientRect();
    cb("top" in clientBoundingRect && "left" in clientBoundingRect && "x" in clientBoundingRect && "y" in clientBoundingRect && "width" in clientBoundingRect && "height" in clientBoundingRect && clientBoundingRect.top > 0 && clientBoundingRect.left > 0 && clientBoundingRect.x > 0 && clientBoundingRect.y > 0 && clientBoundingRect.width > 0 && clientBoundingRect.height > 0);
  })(callback);
})();
