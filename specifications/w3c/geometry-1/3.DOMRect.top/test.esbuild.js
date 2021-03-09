(function (cb) {
	var domRect = new DOMRect();
	cb(typeof domRect.top !== "undefined");
})(callback);
