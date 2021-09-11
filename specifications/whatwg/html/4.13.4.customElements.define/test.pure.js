(function (cb) {
	class Foo extends HTMLElement {
		connectedCallback() {
			this._baz = 'hello';
		}

		baz() {
			return this._baz;
		}
	}

	customElements.define('web-test-foo', Foo);
	document.body.appendChild(new Foo());
	var foo = document.getElementsByTagName('web-test-foo')[0];

	setTimeout(() => {
		cb(foo.baz() === 'hello');
	}, 100);
})(callback);
