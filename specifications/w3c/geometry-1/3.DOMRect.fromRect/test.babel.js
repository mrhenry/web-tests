(function (cb) {
  var domRect = DOMRect.fromRect(new DOMRect());
  cb(!!domRect);
})(callback);
