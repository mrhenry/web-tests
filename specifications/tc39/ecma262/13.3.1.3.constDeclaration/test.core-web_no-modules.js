/******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
function _readOnlyError(name) { throw new TypeError("\"" + name + "\" is read-only"); }

(function (cb) {
  var foo = "foo";

  try {
    5, _readOnlyError("foo");
    cb(false);
  } catch (_) {
    cb(foo === "foo");
  }
})(callback);
/******/ })()
;