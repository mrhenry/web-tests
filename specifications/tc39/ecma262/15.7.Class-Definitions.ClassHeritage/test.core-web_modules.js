/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
(function (cb) {
  class Alpha {
    constructor(some) {
      this._some = some;
    }

    get some() {
      return this._some;
    }

  }

  class Beta extends Alpha {
    constructor() {
      super('hello');
    }

  }

  class Delta extends Alpha {
    constructor(some) {
      super(some);
    }

    get some() {
      return 'hello ' + this._some;
    }

  }

  var beta = new Beta();
  var delta = new Delta('world');
  cb(beta.some === 'hello' && delta.some === 'hello world');
})(callback);
/******/ })()
;