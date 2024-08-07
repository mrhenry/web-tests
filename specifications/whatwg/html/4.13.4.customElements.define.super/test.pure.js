(function (cb) {
	class Foo extends HTMLElement {
		connectedCallback() {
			this._baz = 'hello';
		}

		baz() {
			return this._baz;
		}
	}

	class Fooz extends Foo {
		connectedCallback() {
			super.connectedCallback();

			this._baz = this._baz + ' world';
		}
	}

	customElements.define('web-test-fooz', Fooz);
	document.body.appendChild(new Fooz());
	var fooz = document.getElementsByTagName('web-test-fooz')[0];

	cb(fooz.baz() === 'hello world');
})(callback);
