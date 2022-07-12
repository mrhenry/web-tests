(function (cb) {
  cb(Promise.prototype[Symbol.toStringTag] === 'Promise');
})(callback);
