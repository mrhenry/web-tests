(function() {
  // specifications/tc39/ecma262/23.1.2.1.Array.from/test.pure.js
  (function(cb) {
    var a = [];
    a.push("a");
    if (Array.from(a)[0] !== "a") {
      return false;
    }
    var s = new Set();
    s.add("a");
    if (Array.from(s)[0] !== "a") {
      cb(false);
      return;
    }
    var m = new Map();
    m.set("a", "1");
    if (Array.from(m)[0][0] !== "a") {
      cb(false);
      return;
    }
    function f() {
      return Array.from(arguments);
    }
    if (Array.from(f("a", "b"))[0] !== "a") {
      cb(false);
      return;
    }
    var imgA = document.createElement("IMG");
    var imgB = document.createElement("IMG");
    document.body.appendChild(imgA);
    document.body.appendChild(imgB);
    var images = document.getElementsByTagName("img");
    if (Array.from(images)[0] !== imgA) {
      cb(false);
      return;
    }
    cb(true);
  })(callback);
})();
