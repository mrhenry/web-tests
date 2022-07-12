(function (cb) {
	var descriptor = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, Symbol.toStringTag);

	cb(descriptor.value === 'ArrayBuffer');
})(callback);
