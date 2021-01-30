(function (cb) {
  var foo = new WeakMap();
  cb(!!foo);
})(callback);
