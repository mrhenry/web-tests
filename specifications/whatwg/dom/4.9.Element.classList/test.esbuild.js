(function() {
  // specifications/whatwg/dom/4.9.Element.classList/test.pure.js
  (function(cb) {
    var div = document.createElement("div");
    div.classList.add("classlist-test");
    cb(div.className === "classlist-test");
  })(callback);
})();
