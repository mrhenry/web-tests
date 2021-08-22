(function (cb) {
  // trigger DOMRect import
  var foo = new DOMRect();
  var el = document.getElementById("the-fixture--positioned");
  var clientBoundingRect = new DOMRect(el.getBoundingClientRect());
  cb("top" in clientBoundingRect && "left" in clientBoundingRect && "x" in clientBoundingRect && "y" in clientBoundingRect && "width" in clientBoundingRect && "height" in clientBoundingRect && clientBoundingRect.top > 0 && clientBoundingRect.left > 0 && clientBoundingRect.x > 0 && clientBoundingRect.y > 0 && clientBoundingRect.width > 0 && clientBoundingRect.height > 0);
})(callback);
