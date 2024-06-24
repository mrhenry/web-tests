function _readOnlyError(r) { throw new TypeError('"' + r + '" is read-only'); }
(function (cb) {
  var foo = "foo";
  try {
    5, _readOnlyError("foo");
    cb(false);
  } catch (_) {
    cb(foo === "foo");
  }
})(callback);
