(function (cb) {
  var foo = document.querySelector('div:has(> #the-fixture--positioned, :does-not-exist)');
  cb(foo.matches(':has(> #the-fixture--positioned)'));
})(callback);
