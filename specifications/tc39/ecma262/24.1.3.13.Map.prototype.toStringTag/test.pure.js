(function (cb) {
	var descriptor = Object.getOwnPropertyDescriptor(Map.prototype, Symbol.toStringTag);

	cb(descriptor.value === 'Map');
})(callback);
