"use strict";

(function () {
  try {
    return typeof "foo" === "string";
  } catch (err) {
    return false;
  }
})();
