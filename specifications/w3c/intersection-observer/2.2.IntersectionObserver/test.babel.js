(function (cb) {
  var foo = new IntersectionObserver(function () {// noop
  }, {});
  cb(!!foo);
})(callback);
