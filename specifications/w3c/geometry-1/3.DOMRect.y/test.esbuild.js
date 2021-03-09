(function (cb) {
	var domRect = new DOMRect();
	cb(typeof domRect.y !== "undefined");
})(callback);
