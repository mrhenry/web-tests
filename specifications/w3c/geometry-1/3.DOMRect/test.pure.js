(function (cb) {
	var domRect = new DOMRect();
	cb(domRect.x === 0 && domRect.y === 0);
})(callback);
