(function (cb) {
  var domRect = new DOMRect();
  cb(typeof domRect.bottom !== "undefined");
})(callback);
