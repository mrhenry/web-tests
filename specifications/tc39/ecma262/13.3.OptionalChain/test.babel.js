(function (cb, _foo$baz) {
  var foo = {};
  if (foo !== null && foo !== void 0 && (_foo$baz = foo.baz) !== null && _foo$baz !== void 0 && _foo$baz.bar) {
    cb(false);
  } else {
    cb(true);
  }
})(callback);
