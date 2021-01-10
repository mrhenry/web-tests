"use strict";

(function () {
  try {
    var foo;
    return typeof foo === "undefined";
  } catch (err) {
    return false;
  }
})();
