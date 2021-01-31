/******/ (() => { // webpackBootstrap
(function (cb) {
  var wrongThis = false;

  function a1() {
    if (this !== window) {
      wrongThis = true;
    }

    var a2 = () => {
      if (this !== window) {
        wrongThis = true;
      }
    };

    a2();
  }

  function b1() {
    if (this !== window) {
      wrongThis = true;
    }

    var b2 = function b2() {
      if (this !== window) {
        wrongThis = true;
      }
    };

    b2();
  }

  function c1() {
    "use strict";

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
    "use strict";

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
      cb.bind(this)();
    }

  }

  a1();
  b1();
  c1();
  d1();
  var f1 = new F1();
  f1.f2();
  f1.f3(function () {
    if (this !== window) {
      wrongThis = true;
    }
  });
  f1.f3(() => {
    if (this !== window) {
      wrongThis = true;
    }
  });
  f1.f4(function () {
    if (this !== f1) {
      console.log(this);
      wrongThis = true;
    }
  });
  f1.f4(() => {
    if (this !== window) {
      console.log(this);
      wrongThis = true;
    }
  });
  cb(!wrongThis);
})(callback);
/******/ })()
;