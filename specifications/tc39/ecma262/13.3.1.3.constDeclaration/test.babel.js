function _readOnlyError(name) { throw new TypeError("\"" + name + "\" is read-only"); }

(function (cb) {
  var foo = "foo";

  try {
    foo = (_readOnlyError("foo"), 5);
    cb(false);
  } catch (_) {
    cb(foo === "foo");
  }
})(callback);
