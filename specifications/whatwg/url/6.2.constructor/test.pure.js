(function (cb) {
	var params = new URLSearchParams();
	cb(params.toString() === "");
})(callback);
