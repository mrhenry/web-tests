/******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
(function (cb) {
  var resolvedTimeZone = new Intl.DateTimeFormat('en', {
    timeZone: 'Australia/Sydney',
    timeZoneName: 'short'
  }).resolvedOptions().timeZone;
  cb(resolvedTimeZone === 'Australia/Sydney');
})(callback);
/******/ })()
;