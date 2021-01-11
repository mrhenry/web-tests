(function (cb) {
  var foo = true;
  var baz = false;
  cb(foo && !baz);
})(callback);
