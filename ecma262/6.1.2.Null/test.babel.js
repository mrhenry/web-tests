(function () {
  try {
    var foo = null;
    return !foo && typeof foo !== "undefined";
  } catch (err) {
    return false;
  }
})();
