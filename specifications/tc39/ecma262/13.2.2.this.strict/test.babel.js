(function (cb) {
  // TODO : there are more cases and gotcha's.
  "use strict";

  var wrongThis = false;

  function c1() {
    if (typeof this !== "undefined") {
      wrongThis = true;
    }
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

  function F1() {}

  F1.prototype.f2 = function () {
    if (!(this instanceof F1)) {
      wrongThis = true;
    }
  };

  F1.prototype.f3 = function (cb) {
    cb();
  };

  F1.prototype.f4 = function (cb) {
    cb.apply(this);
  };

  c1();
  d1();
  var f1 = new F1();
  f1.f2();
  f1.f3(function () {
    if (typeof this !== "undefined") {
      wrongThis = true;
    }
  });
  f1.f4(function () {
    if (this !== f1) {
      wrongThis = true;
    }
  });
  cb(!wrongThis);
})(callback);
