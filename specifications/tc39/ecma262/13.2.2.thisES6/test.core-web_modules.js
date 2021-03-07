/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
(function (cb) {
  "use strict";

  var wrongThis = false;

  function c1() {
    if (typeof this !== "undefined") {
      wrongThis = true;
    }

    var c2 = () => {
      if (typeof this !== "undefined") {
        wrongThis = true;
      }
    };

    c2();
  }

  function d1() {
    if (typeof this !== "undefined") {
      wrongThis = true;
    }

    var d2 = function d2() {
      if (typeof this !== "undefined") {
        wrongThis = true;
      }
    };

    d2();
  }

  class F1 {
    f2() {
      if (!(this instanceof F1)) {
        wrongThis = true;
      }
    }

    f3(cb) {
      cb();
    }

    f4(cb) {
      cb.apply(this);
    }

  }

  c1();
  d1();
  var f1 = new F1();
  f1.f2();
  f1.f3(function () {
    if (typeof this !== "undefined") {
      wrongThis = true;
    }
  });
  f1.f3(() => {
    if (typeof this !== "undefined") {
      wrongThis = true;
    }
  });
  f1.f4(function () {
    if (this !== f1) {
      wrongThis = true;
    }
  });
  f1.f4(() => {
    if (typeof this !== "undefined") {
      wrongThis = true;
    }
  });
  cb(!wrongThis);
})(callback);
/******/ })()
;