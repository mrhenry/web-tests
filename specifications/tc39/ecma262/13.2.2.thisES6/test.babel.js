function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
(function (cb) {
  // TODO : there are more cases and gotcha's.
  "use strict";

  var _this2 = this;
  var wrongThis = false;
  function c1() {
    var _this = this;
    if (typeof this !== "undefined") {
      wrongThis = true;
    }
    var c2 = function c2() {
      if (typeof _this !== "undefined") {
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
  var F1 = /*#__PURE__*/function () {
    function F1() {
      _classCallCheck(this, F1);
    }
    return _createClass(F1, [{
      key: "f2",
      value: function f2() {
        if (!(this instanceof F1)) {
          wrongThis = true;
        }
      }
    }, {
      key: "f3",
      value: function f3(cb) {
        cb();
      }
    }, {
      key: "f4",
      value: function f4(cb) {
        cb.apply(this);
      }
    }]);
  }();
  c1();
  d1();
  var f1 = new F1();
  f1.f2();
  f1.f3(function () {
    if (typeof this !== "undefined") {
      wrongThis = true;
    }
  });
  f1.f3(function () {
    if (typeof _this2 !== "undefined") {
      wrongThis = true;
    }
  });
  f1.f4(function () {
    if (this !== f1) {
      wrongThis = true;
    }
  });
  f1.f4(function () {
    if (typeof _this2 !== "undefined") {
      wrongThis = true;
    }
  });
  cb(!wrongThis);
})(callback);
