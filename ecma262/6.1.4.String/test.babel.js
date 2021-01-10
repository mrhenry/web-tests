(function () {
  try {
    var foo = "foo";
    return typeof foo === "string" && foo[0] === "f";
  } catch (err) {
    return false;
  }
})();
