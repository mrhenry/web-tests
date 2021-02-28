/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
(function (cb) {
  setTimeout(function () {
    var entries = performance.getEntriesByType("paint");

    if (!entries || !entries.length) {
      cb(false);
      return;
    }

    var firstEntry = entries[0];
    cb(firstEntry.entryType == "paint" && typeof firstEntry.duration !== "undefined" && typeof firstEntry.startTime !== "undefined" && typeof firstEntry.name !== "undefined");
  }, 500);
})(callback);
/******/ })()
;