(function (cb) {
  var domRect = new DOMRect();
  cb(typeof domRect.height !== "undefined");
})(callback);
