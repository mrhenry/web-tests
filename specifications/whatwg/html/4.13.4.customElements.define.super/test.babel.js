function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _superPropGet(r, e, p, f) { var n = _get(_getPrototypeOf(1 & f ? r.prototype : r), e, p); return 2 & f && "function" == typeof n ? function (t) { return n.apply(p, t); } : n; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (t, r, n) { var l = _superPropBase(t, r); if (l) { var f = Object.getOwnPropertyDescriptor(l, r); return f.get ? f.get.call(arguments.length < 3 ? t : n) : f.value; } }, _get.apply(null, arguments); }
function _superPropBase(o, t) { for (; !{}.hasOwnProperty.call(o, t) && null !== (o = _getPrototypeOf(o));); return o; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(r, t) { for (var o = 0; o < t.length; o++) { var i = t[o]; i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(r, _toPropertyKey(i.key), i); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(r) { var o = _toPrimitive(r, "string"); return "symbol" == _typeof(o) ? o : o + ""; }
function _toPrimitive(t, e) { if ("object" != _typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
function _inherits(t, r) { if ("function" != typeof r && null !== r) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(r && r.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), r && _setPrototypeOf(t, r); }
function _callSuper(e, c, p) { return c = _getPrototypeOf(c), _possibleConstructorReturn(e, _isNativeReflectConstruct() ? Reflect.construct(c, p || [], _getPrototypeOf(e).constructor) : c.apply(e, p)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _wrapNativeSuper(p) { var n = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(p) { if (null === p || !_isNativeFunction(p)) return p; if ("function" != typeof p) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== n) { if (n.has(p)) return n.get(p); n.set(p, Wrapper); } function Wrapper() { return _construct(p, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(p.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, p); }, _wrapNativeSuper(p); }
function _construct(e, o, p) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var n = [null]; n.push.apply(n, o); var l = new (e.bind.apply(e, n))(); return p && _setPrototypeOf(l, p.prototype), l; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
(function (cb) {
  var Foo = /*#__PURE__*/function (_HTMLElement) {
    function Foo() {
      _classCallCheck(this, Foo);
      return _callSuper(this, Foo, arguments);
    }
    _inherits(Foo, _HTMLElement);
    return _createClass(Foo, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        this._baz = 'hello';
      }
    }, {
      key: "baz",
      value: function baz() {
        return this._baz;
      }
    }]);
  }(/*#__PURE__*/_wrapNativeSuper(HTMLElement));
  var Fooz = /*#__PURE__*/function (_Foo) {
    function Fooz() {
      _classCallCheck(this, Fooz);
      return _callSuper(this, Fooz, arguments);
    }
    _inherits(Fooz, _Foo);
    return _createClass(Fooz, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        _superPropGet(Fooz, "connectedCallback", this, 3)([]);
        this._baz = this._baz + ' world';
      }
    }]);
  }(Foo);
  customElements.define('web-test-fooz', Fooz);
  document.body.appendChild(new Fooz());
  var fooz = document.getElementsByTagName('web-test-fooz')[0];
  cb(fooz.baz() === 'hello world');
})(callback);
