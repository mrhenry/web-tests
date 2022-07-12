(function (cb) {
	cb(Object.getPrototypeOf(''[Symbol.iterator]())[Symbol.toStringTag] === 'String Iterator');
})(callback);
