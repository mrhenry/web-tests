(function (cb) {
	cb(Object.getPrototypeOf([][Symbol.iterator]())[Symbol.toStringTag] === 'Array Iterator');
})(callback);
