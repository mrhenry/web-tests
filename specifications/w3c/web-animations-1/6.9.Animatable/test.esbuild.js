(function() {
  // specifications/w3c/web-animations-1/6.9.Animatable/test.pure.js
  (function(cb) {
    var el = document.getElementById("the-fixture");
    var animation = el.animate({
      opacity: [0.5, 1],
      transform: ["scale(0.5)", "scale(1)"]
    }, {
      direction: "alternate",
      duration: 500,
      iterations: Infinity
    });
    cb(!!animation);
  })(callback);
})();
