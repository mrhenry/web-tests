(function (cb) {
	var descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(new Set()[Symbol.iterator]()), Symbol.toStringTag);

	cb(descriptor.value === 'Set Iterator');
})(callback);
