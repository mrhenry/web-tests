(function (cb) {
	var domRect = new DOMRect();
	cb(typeof domRect.width !== "undefined");
})(callback);
