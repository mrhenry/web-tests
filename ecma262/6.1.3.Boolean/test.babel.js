"use strict";

(function () {
  try {
    var foo = true;
    var baz = false;
    return foo && !baz;
  } catch (err) {
    return false;
  }
})();
