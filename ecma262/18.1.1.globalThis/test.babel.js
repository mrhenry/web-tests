import "core-js/modules/es.global-this.js";

(function (cb) {
  cb(typeof globalThis !== "undefined" && typeof globalThis.String !== "undefined");
})(callback);
