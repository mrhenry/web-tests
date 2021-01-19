(function (cb) {
	var foo = "foo";
	cb(typeof foo === "string" && foo[0] === "f");
})(callback);
