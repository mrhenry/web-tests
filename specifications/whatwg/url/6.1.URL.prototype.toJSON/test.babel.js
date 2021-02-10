(function (cb) {
  var foo = new URL("https://developer.mozilla.org/en-US/docs/Web/API/URL/toString");
  cb(foo.toJSON() === foo.href);
})(callback);
