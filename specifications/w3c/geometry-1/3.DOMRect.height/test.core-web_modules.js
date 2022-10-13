/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 142:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

(function (undefined) {
  if (!("DOMRect" in self && function (e) {
    try {
      return new e();
    } catch (e) {
      return !1;
    }
  }(self.DOMRect))) {
    (function (global) {
      function number(v) {
        return v === undefined ? 0 : Number(v);
      }
      function different(u, v) {
        return u !== v && !(isNaN(u) && isNaN(v));
      }
      function DOMRect(xArg, yArg, wArg, hArg) {
        var x, y, width, height, left, right, top, bottom;
        x = number(xArg);
        y = number(yArg);
        width = number(wArg);
        height = number(hArg);
        Object.defineProperties(this, {
          x: {
            get: function () {
              return x;
            },
            set: function (newX) {
              if (different(x, newX)) {
                x = newX;
                left = right = undefined;
              }
            },
            enumerable: true
          },
          y: {
            get: function () {
              return y;
            },
            set: function (newY) {
              if (different(y, newY)) {
                y = newY;
                top = bottom = undefined;
              }
            },
            enumerable: true
          },
          width: {
            get: function () {
              return width;
            },
            set: function (newWidth) {
              if (different(width, newWidth)) {
                width = newWidth;
                left = right = undefined;
              }
            },
            enumerable: true
          },
          height: {
            get: function () {
              return height;
            },
            set: function (newHeight) {
              if (different(height, newHeight)) {
                height = newHeight;
                top = bottom = undefined;
              }
            },
            enumerable: true
          },
          left: {
            get: function () {
              if (left === undefined) {
                left = x + Math.min(0, width);
              }
              return left;
            },
            enumerable: true
          },
          right: {
            get: function () {
              if (right === undefined) {
                right = x + Math.max(0, width);
              }
              return right;
            },
            enumerable: true
          },
          top: {
            get: function () {
              if (top === undefined) {
                top = y + Math.min(0, height);
              }
              return top;
            },
            enumerable: true
          },
          bottom: {
            get: function () {
              if (bottom === undefined) {
                bottom = y + Math.max(0, height);
              }
              return bottom;
            },
            enumerable: true
          }
        });
      }
      global.DOMRect = DOMRect;
    })(self);
  }
}).call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof __webpack_require__.g && __webpack_require__.g || {});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/* harmony import */ var _mrhenry_core_web_modules_DOMRect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(142);
/* harmony import */ var _mrhenry_core_web_modules_DOMRect__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_mrhenry_core_web_modules_DOMRect__WEBPACK_IMPORTED_MODULE_0__);

(function (cb) {
  var domRect = new DOMRect();
  cb(typeof domRect.height !== "undefined");
})(callback);
})();

/******/ })()
;