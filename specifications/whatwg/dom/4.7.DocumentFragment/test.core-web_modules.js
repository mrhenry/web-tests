/******/ (() => { // webpackBootstrap
(function (cb) {
  var fixture = document.getElementById('the-fixture');
  var fragment = new DocumentFragment();
  var child = document.createElement('div');
  child.id = "child-added-with-js";
  fragment.appendChild(child);
  fixture.appendChild(fragment);
  var result = document.getElementById('child-added-with-js');
  cb(!!result && result.parentNode === fixture);
})(callback);
/******/ })()
;