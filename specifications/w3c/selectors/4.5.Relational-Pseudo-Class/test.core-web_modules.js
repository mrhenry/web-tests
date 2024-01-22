/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 509:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isCallable = __webpack_require__(9985);
var tryToString = __webpack_require__(3691);

var $TypeError = TypeError;

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw new $TypeError(tryToString(argument) + ' is not a function');
};


/***/ }),

/***/ 3550:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isPossiblePrototype = __webpack_require__(598);

var $String = String;
var $TypeError = TypeError;

module.exports = function (argument) {
  if (isPossiblePrototype(argument)) return argument;
  throw new $TypeError("Can't set " + $String(argument) + ' as a prototype');
};


/***/ }),

/***/ 1514:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var charAt = (__webpack_require__(730).charAt);

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};


/***/ }),

/***/ 767:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isPrototypeOf = __webpack_require__(3622);

var $TypeError = TypeError;

module.exports = function (it, Prototype) {
  if (isPrototypeOf(Prototype, it)) return it;
  throw new $TypeError('Incorrect invocation');
};


/***/ }),

/***/ 5027:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isObject = __webpack_require__(8999);

var $String = String;
var $TypeError = TypeError;

// `Assert: Type(argument) is Object`
module.exports = function (argument) {
  if (isObject(argument)) return argument;
  throw new $TypeError($String(argument) + ' is not an object');
};


/***/ }),

/***/ 4328:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var toIndexedObject = __webpack_require__(5290);
var toAbsoluteIndex = __webpack_require__(7578);
var lengthOfArrayLike = __webpack_require__(6310);

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),

/***/ 6834:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var fails = __webpack_require__(3689);

module.exports = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};


/***/ }),

/***/ 5649:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var DESCRIPTORS = __webpack_require__(7697);
var isArray = __webpack_require__(2297);

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Safari < 13 does not throw an error in this case
var SILENT_ON_NON_WRITABLE_LENGTH_SET = DESCRIPTORS && !function () {
  // makes no sense without proper strict mode support
  if (this !== undefined) return true;
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).length = 1;
  } catch (error) {
    return error instanceof TypeError;
  }
}();

module.exports = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
  if (isArray(O) && !getOwnPropertyDescriptor(O, 'length').writable) {
    throw new $TypeError('Cannot set read only .length');
  } return O.length = length;
} : function (O, length) {
  return O.length = length;
};


/***/ }),

/***/ 6004:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);

module.exports = uncurryThis([].slice);


/***/ }),

/***/ 382:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var arraySlice = __webpack_require__(6004);

var floor = Math.floor;

var sort = function (array, comparefn) {
  var length = array.length;

  if (length < 8) {
    // insertion sort
    var i = 1;
    var element, j;

    while (i < length) {
      j = i;
      element = array[i];
      while (j && comparefn(array[j - 1], element) > 0) {
        array[j] = array[--j];
      }
      if (j !== i++) array[j] = element;
    }
  } else {
    // merge sort
    var middle = floor(length / 2);
    var left = sort(arraySlice(array, 0, middle), comparefn);
    var right = sort(arraySlice(array, middle), comparefn);
    var llength = left.length;
    var rlength = right.length;
    var lindex = 0;
    var rindex = 0;

    while (lindex < llength || rindex < rlength) {
      array[lindex + rindex] = (lindex < llength && rindex < rlength)
        ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
        : lindex < llength ? left[lindex++] : right[rindex++];
    }
  }

  return array;
};

module.exports = sort;


/***/ }),

/***/ 6648:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);

var toString = uncurryThis({}.toString);
var stringSlice = uncurryThis(''.slice);

module.exports = function (it) {
  return stringSlice(toString(it), 8, -1);
};


/***/ }),

/***/ 926:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var TO_STRING_TAG_SUPPORT = __webpack_require__(3043);
var isCallable = __webpack_require__(9985);
var classofRaw = __webpack_require__(6648);
var wellKnownSymbol = __webpack_require__(4201);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var $Object = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};


/***/ }),

/***/ 8758:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var hasOwn = __webpack_require__(6812);
var ownKeys = __webpack_require__(9152);
var getOwnPropertyDescriptorModule = __webpack_require__(2474);
var definePropertyModule = __webpack_require__(2560);

module.exports = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};


/***/ }),

/***/ 5773:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var DESCRIPTORS = __webpack_require__(7697);
var definePropertyModule = __webpack_require__(2560);
var createPropertyDescriptor = __webpack_require__(5684);

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ 5684:
/***/ ((module) => {


module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ 2148:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var makeBuiltIn = __webpack_require__(8702);
var defineProperty = __webpack_require__(2560);

module.exports = function (target, name, descriptor) {
  if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
  if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
  return defineProperty.f(target, name, descriptor);
};


/***/ }),

/***/ 1880:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isCallable = __webpack_require__(9985);
var definePropertyModule = __webpack_require__(2560);
var makeBuiltIn = __webpack_require__(8702);
var defineGlobalProperty = __webpack_require__(5014);

module.exports = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable(value)) makeBuiltIn(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};


/***/ }),

/***/ 5014:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var global = __webpack_require__(9037);

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

module.exports = function (key, value) {
  try {
    defineProperty(global, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),

/***/ 8494:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var tryToString = __webpack_require__(3691);

var $TypeError = TypeError;

module.exports = function (O, P) {
  if (!delete O[P]) throw new $TypeError('Cannot delete property ' + tryToString(P) + ' of ' + tryToString(O));
};


/***/ }),

/***/ 7697:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var fails = __webpack_require__(3689);

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});


/***/ }),

/***/ 6420:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var global = __webpack_require__(9037);
var isObject = __webpack_require__(8999);

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ 5565:
/***/ ((module) => {


var $TypeError = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

module.exports = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError('Maximum allowed index exceeded');
  return it;
};


/***/ }),

/***/ 7136:
/***/ ((module) => {


module.exports = {
  IndexSizeError: { s: 'INDEX_SIZE_ERR', c: 1, m: 1 },
  DOMStringSizeError: { s: 'DOMSTRING_SIZE_ERR', c: 2, m: 0 },
  HierarchyRequestError: { s: 'HIERARCHY_REQUEST_ERR', c: 3, m: 1 },
  WrongDocumentError: { s: 'WRONG_DOCUMENT_ERR', c: 4, m: 1 },
  InvalidCharacterError: { s: 'INVALID_CHARACTER_ERR', c: 5, m: 1 },
  NoDataAllowedError: { s: 'NO_DATA_ALLOWED_ERR', c: 6, m: 0 },
  NoModificationAllowedError: { s: 'NO_MODIFICATION_ALLOWED_ERR', c: 7, m: 1 },
  NotFoundError: { s: 'NOT_FOUND_ERR', c: 8, m: 1 },
  NotSupportedError: { s: 'NOT_SUPPORTED_ERR', c: 9, m: 1 },
  InUseAttributeError: { s: 'INUSE_ATTRIBUTE_ERR', c: 10, m: 1 },
  InvalidStateError: { s: 'INVALID_STATE_ERR', c: 11, m: 1 },
  SyntaxError: { s: 'SYNTAX_ERR', c: 12, m: 1 },
  InvalidModificationError: { s: 'INVALID_MODIFICATION_ERR', c: 13, m: 1 },
  NamespaceError: { s: 'NAMESPACE_ERR', c: 14, m: 1 },
  InvalidAccessError: { s: 'INVALID_ACCESS_ERR', c: 15, m: 1 },
  ValidationError: { s: 'VALIDATION_ERR', c: 16, m: 0 },
  TypeMismatchError: { s: 'TYPE_MISMATCH_ERR', c: 17, m: 1 },
  SecurityError: { s: 'SECURITY_ERR', c: 18, m: 1 },
  NetworkError: { s: 'NETWORK_ERR', c: 19, m: 1 },
  AbortError: { s: 'ABORT_ERR', c: 20, m: 1 },
  URLMismatchError: { s: 'URL_MISMATCH_ERR', c: 21, m: 1 },
  QuotaExceededError: { s: 'QUOTA_EXCEEDED_ERR', c: 22, m: 1 },
  TimeoutError: { s: 'TIMEOUT_ERR', c: 23, m: 1 },
  InvalidNodeTypeError: { s: 'INVALID_NODE_TYPE_ERR', c: 24, m: 1 },
  DataCloneError: { s: 'DATA_CLONE_ERR', c: 25, m: 1 }
};


/***/ }),

/***/ 7365:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var userAgent = __webpack_require__(71);

var firefox = userAgent.match(/firefox\/(\d+)/i);

module.exports = !!firefox && +firefox[1];


/***/ }),

/***/ 7298:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var UA = __webpack_require__(71);

module.exports = /MSIE|Trident/.test(UA);


/***/ }),

/***/ 806:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var global = __webpack_require__(9037);
var classof = __webpack_require__(6648);

module.exports = classof(global.process) === 'process';


/***/ }),

/***/ 71:
/***/ ((module) => {


module.exports = typeof navigator != 'undefined' && String(navigator.userAgent) || '';


/***/ }),

/***/ 3615:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var global = __webpack_require__(9037);
var userAgent = __webpack_require__(71);

var process = global.process;
var Deno = global.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

module.exports = version;


/***/ }),

/***/ 7922:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var userAgent = __webpack_require__(71);

var webkit = userAgent.match(/AppleWebKit\/(\d+)\./);

module.exports = !!webkit && +webkit[1];


/***/ }),

/***/ 2739:
/***/ ((module) => {


// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),

/***/ 6610:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);

var $Error = Error;
var replace = uncurryThis(''.replace);

var TEST = (function (arg) { return String(new $Error(arg).stack); })('zxcasd');
// eslint-disable-next-line redos/no-vulnerable -- safe
var V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/;
var IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST);

module.exports = function (stack, dropEntries) {
  if (IS_V8_OR_CHAKRA_STACK && typeof stack == 'string' && !$Error.prepareStackTrace) {
    while (dropEntries--) stack = replace(stack, V8_OR_CHAKRA_STACK_ENTRY, '');
  } return stack;
};


/***/ }),

/***/ 5411:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var createNonEnumerableProperty = __webpack_require__(5773);
var clearErrorStack = __webpack_require__(6610);
var ERROR_STACK_INSTALLABLE = __webpack_require__(9599);

// non-standard V8
var captureStackTrace = Error.captureStackTrace;

module.exports = function (error, C, stack, dropEntries) {
  if (ERROR_STACK_INSTALLABLE) {
    if (captureStackTrace) captureStackTrace(error, C);
    else createNonEnumerableProperty(error, 'stack', clearErrorStack(stack, dropEntries));
  }
};


/***/ }),

/***/ 9599:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var fails = __webpack_require__(3689);
var createPropertyDescriptor = __webpack_require__(5684);

module.exports = !fails(function () {
  var error = new Error('a');
  if (!('stack' in error)) return true;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  Object.defineProperty(error, 'stack', createPropertyDescriptor(1, 7));
  return error.stack !== 7;
});


/***/ }),

/***/ 445:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var DESCRIPTORS = __webpack_require__(7697);
var fails = __webpack_require__(3689);
var anObject = __webpack_require__(5027);
var normalizeStringArgument = __webpack_require__(3841);

var nativeErrorToString = Error.prototype.toString;

var INCORRECT_TO_STRING = fails(function () {
  if (DESCRIPTORS) {
    // Chrome 32- incorrectly call accessor
    // eslint-disable-next-line es/no-object-create, es/no-object-defineproperty -- safe
    var object = Object.create(Object.defineProperty({}, 'name', { get: function () {
      return this === object;
    } }));
    if (nativeErrorToString.call(object) !== 'true') return true;
  }
  // FF10- does not properly handle non-strings
  return nativeErrorToString.call({ message: 1, name: 2 }) !== '2: 1'
    // IE8 does not properly handle defaults
    || nativeErrorToString.call({}) !== 'Error';
});

module.exports = INCORRECT_TO_STRING ? function toString() {
  var O = anObject(this);
  var name = normalizeStringArgument(O.name, 'Error');
  var message = normalizeStringArgument(O.message);
  return !name ? message : !message ? name : name + ': ' + message;
} : nativeErrorToString;


/***/ }),

/***/ 9989:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var global = __webpack_require__(9037);
var getOwnPropertyDescriptor = (__webpack_require__(2474).f);
var createNonEnumerableProperty = __webpack_require__(5773);
var defineBuiltIn = __webpack_require__(1880);
var defineGlobalProperty = __webpack_require__(5014);
var copyConstructorProperties = __webpack_require__(8758);
var isForced = __webpack_require__(5266);

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = global[TARGET] && global[TARGET].prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    defineBuiltIn(target, key, sourceProperty, options);
  }
};


/***/ }),

/***/ 3689:
/***/ ((module) => {


module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ 8678:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


// TODO: Remove from `core-js@4` since it's moved to entry points
__webpack_require__(4043);
var call = __webpack_require__(2615);
var defineBuiltIn = __webpack_require__(1880);
var regexpExec = __webpack_require__(6308);
var fails = __webpack_require__(3689);
var wellKnownSymbol = __webpack_require__(4201);
var createNonEnumerableProperty = __webpack_require__(5773);

var SPECIES = wellKnownSymbol('species');
var RegExpPrototype = RegExp.prototype;

module.exports = function (KEY, exec, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegExp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) !== 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () {
      execCalled = true;
      return null;
    };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    FORCED
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      var $exec = regexp.exec;
      if ($exec === regexpExec || $exec === RegExpPrototype.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: call(nativeRegExpMethod, regexp, str, arg2) };
        }
        return { done: true, value: call(nativeMethod, str, regexp, arg2) };
      }
      return { done: false };
    });

    defineBuiltIn(String.prototype, KEY, methods[0]);
    defineBuiltIn(RegExpPrototype, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty(RegExpPrototype[SYMBOL], 'sham', true);
};


/***/ }),

/***/ 1735:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var NATIVE_BIND = __webpack_require__(7215);

var FunctionPrototype = Function.prototype;
var apply = FunctionPrototype.apply;
var call = FunctionPrototype.call;

// eslint-disable-next-line es/no-reflect -- safe
module.exports = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function () {
  return call.apply(apply, arguments);
});


/***/ }),

/***/ 7215:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var fails = __webpack_require__(3689);

module.exports = !fails(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});


/***/ }),

/***/ 2615:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var NATIVE_BIND = __webpack_require__(7215);

var call = Function.prototype.call;

module.exports = NATIVE_BIND ? call.bind(call) : function () {
  return call.apply(call, arguments);
};


/***/ }),

/***/ 1236:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var DESCRIPTORS = __webpack_require__(7697);
var hasOwn = __webpack_require__(6812);

var FunctionPrototype = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

module.exports = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};


/***/ }),

/***/ 2743:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);
var aCallable = __webpack_require__(509);

module.exports = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};


/***/ }),

/***/ 8844:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var NATIVE_BIND = __webpack_require__(7215);

var FunctionPrototype = Function.prototype;
var call = FunctionPrototype.call;
var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

module.exports = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
  return function () {
    return call.apply(fn, arguments);
  };
};


/***/ }),

/***/ 6058:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var global = __webpack_require__(9037);
var isCallable = __webpack_require__(9985);

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global[namespace]) : global[namespace] && global[namespace][method];
};


/***/ }),

/***/ 4849:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var aCallable = __webpack_require__(509);
var isNullOrUndefined = __webpack_require__(981);

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};


/***/ }),

/***/ 7017:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);
var toObject = __webpack_require__(690);

var floor = Math.floor;
var charAt = uncurryThis(''.charAt);
var replace = uncurryThis(''.replace);
var stringSlice = uncurryThis(''.slice);
// eslint-disable-next-line redos/no-vulnerable -- safe
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

// `GetSubstitution` abstract operation
// https://tc39.es/ecma262/#sec-getsubstitution
module.exports = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace(replacement, symbols, function (match, ch) {
    var capture;
    switch (charAt(ch, 0)) {
      case '$': return '$';
      case '&': return matched;
      case '`': return stringSlice(str, 0, position);
      case "'": return stringSlice(str, tailPos);
      case '<':
        capture = namedCaptures[stringSlice(ch, 1, -1)];
        break;
      default: // \d\d?
        var n = +ch;
        if (n === 0) return match;
        if (n > m) {
          var f = floor(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? charAt(ch, 1) : captures[f - 1] + charAt(ch, 1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};


/***/ }),

/***/ 9037:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof __webpack_require__.g == 'object' && __webpack_require__.g) ||
  check(typeof this == 'object' && this) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();


/***/ }),

/***/ 6812:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);
var toObject = __webpack_require__(690);

var hasOwnProperty = uncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
module.exports = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};


/***/ }),

/***/ 7248:
/***/ ((module) => {


module.exports = {};


/***/ }),

/***/ 2688:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var getBuiltIn = __webpack_require__(6058);

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),

/***/ 8506:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var DESCRIPTORS = __webpack_require__(7697);
var fails = __webpack_require__(3689);
var createElement = __webpack_require__(6420);

// Thanks to IE8 for its funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});


/***/ }),

/***/ 4413:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);
var fails = __webpack_require__(3689);
var classof = __webpack_require__(6648);

var $Object = Object;
var split = uncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) === 'String' ? split(it, '') : $Object(it);
} : $Object;


/***/ }),

/***/ 3457:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isCallable = __webpack_require__(9985);
var isObject = __webpack_require__(8999);
var setPrototypeOf = __webpack_require__(9385);

// makes subclassing work correct for wrapped built-ins
module.exports = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf($this, NewTargetPrototype);
  return $this;
};


/***/ }),

/***/ 6738:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);
var isCallable = __webpack_require__(9985);
var store = __webpack_require__(4091);

var functionToString = uncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString(it);
  };
}

module.exports = store.inspectSource;


/***/ }),

/***/ 2570:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isObject = __webpack_require__(8999);
var createNonEnumerableProperty = __webpack_require__(5773);

// `InstallErrorCause` abstract operation
// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
module.exports = function (O, options) {
  if (isObject(options) && 'cause' in options) {
    createNonEnumerableProperty(O, 'cause', options.cause);
  }
};


/***/ }),

/***/ 618:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var NATIVE_WEAK_MAP = __webpack_require__(9834);
var global = __webpack_require__(9037);
var isObject = __webpack_require__(8999);
var createNonEnumerableProperty = __webpack_require__(5773);
var hasOwn = __webpack_require__(6812);
var shared = __webpack_require__(4091);
var sharedKey = __webpack_require__(2713);
var hiddenKeys = __webpack_require__(7248);

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError = global.TypeError;
var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store = shared.state || (shared.state = new WeakMap());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),

/***/ 2297:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var classof = __webpack_require__(6648);

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
module.exports = Array.isArray || function isArray(argument) {
  return classof(argument) === 'Array';
};


/***/ }),

/***/ 9985:
/***/ ((module) => {


// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
var documentAll = typeof document == 'object' && document.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
module.exports = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};


/***/ }),

/***/ 5266:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var fails = __webpack_require__(3689);
var isCallable = __webpack_require__(9985);

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),

/***/ 981:
/***/ ((module) => {


// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
module.exports = function (it) {
  return it === null || it === undefined;
};


/***/ }),

/***/ 8999:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isCallable = __webpack_require__(9985);

module.exports = function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};


/***/ }),

/***/ 598:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isObject = __webpack_require__(8999);

module.exports = function (argument) {
  return isObject(argument) || argument === null;
};


/***/ }),

/***/ 3931:
/***/ ((module) => {


module.exports = false;


/***/ }),

/***/ 734:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var getBuiltIn = __webpack_require__(6058);
var isCallable = __webpack_require__(9985);
var isPrototypeOf = __webpack_require__(3622);
var USE_SYMBOL_AS_UID = __webpack_require__(9525);

var $Object = Object;

module.exports = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
};


/***/ }),

/***/ 6310:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var toLength = __webpack_require__(3126);

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
module.exports = function (obj) {
  return toLength(obj.length);
};


/***/ }),

/***/ 8702:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);
var fails = __webpack_require__(3689);
var isCallable = __webpack_require__(9985);
var hasOwn = __webpack_require__(6812);
var DESCRIPTORS = __webpack_require__(7697);
var CONFIGURABLE_FUNCTION_NAME = (__webpack_require__(1236).CONFIGURABLE);
var inspectSource = __webpack_require__(6738);
var InternalStateModule = __webpack_require__(618);

var enforceInternalState = InternalStateModule.enforce;
var getInternalState = InternalStateModule.get;
var $String = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var stringSlice = uncurryThis(''.slice);
var replace = uncurryThis(''.replace);
var join = uncurryThis([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function () {
  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn = module.exports = function (value, name, options) {
  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
    name = '[' + replace($String(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
    if (DESCRIPTORS) defineProperty(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
    defineProperty(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS) defineProperty(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwn(state, 'source')) {
    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn(function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
}, 'toString');


/***/ }),

/***/ 8828:
/***/ ((module) => {


var ceil = Math.ceil;
var floor = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
module.exports = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor : ceil)(n);
};


/***/ }),

/***/ 3841:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var toString = __webpack_require__(4327);

module.exports = function (argument, $default) {
  return argument === undefined ? arguments.length < 2 ? '' : $default : toString(argument);
};


/***/ }),

/***/ 5391:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/* global ActiveXObject -- old IE, WSH */
var anObject = __webpack_require__(5027);
var definePropertiesModule = __webpack_require__(8920);
var enumBugKeys = __webpack_require__(2739);
var hiddenKeys = __webpack_require__(7248);
var html = __webpack_require__(2688);
var documentCreateElement = __webpack_require__(6420);
var sharedKey = __webpack_require__(2713);

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
};


/***/ }),

/***/ 8920:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var DESCRIPTORS = __webpack_require__(7697);
var V8_PROTOTYPE_DEFINE_BUG = __webpack_require__(5648);
var definePropertyModule = __webpack_require__(2560);
var anObject = __webpack_require__(5027);
var toIndexedObject = __webpack_require__(5290);
var objectKeys = __webpack_require__(300);

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var props = toIndexedObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
  return O;
};


/***/ }),

/***/ 2560:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var DESCRIPTORS = __webpack_require__(7697);
var IE8_DOM_DEFINE = __webpack_require__(8506);
var V8_PROTOTYPE_DEFINE_BUG = __webpack_require__(5648);
var anObject = __webpack_require__(5027);
var toPropertyKey = __webpack_require__(8360);

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ 2474:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var DESCRIPTORS = __webpack_require__(7697);
var call = __webpack_require__(2615);
var propertyIsEnumerableModule = __webpack_require__(9556);
var createPropertyDescriptor = __webpack_require__(5684);
var toIndexedObject = __webpack_require__(5290);
var toPropertyKey = __webpack_require__(8360);
var hasOwn = __webpack_require__(6812);
var IE8_DOM_DEFINE = __webpack_require__(8506);

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
};


/***/ }),

/***/ 2741:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var internalObjectKeys = __webpack_require__(4948);
var enumBugKeys = __webpack_require__(2739);

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ 7518:
/***/ ((__unused_webpack_module, exports) => {


// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ 3622:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);

module.exports = uncurryThis({}.isPrototypeOf);


/***/ }),

/***/ 4948:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);
var hasOwn = __webpack_require__(6812);
var toIndexedObject = __webpack_require__(5290);
var indexOf = (__webpack_require__(4328).indexOf);
var hiddenKeys = __webpack_require__(7248);

var push = uncurryThis([].push);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};


/***/ }),

/***/ 300:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var internalObjectKeys = __webpack_require__(4948);
var enumBugKeys = __webpack_require__(2739);

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),

/***/ 9556:
/***/ ((__unused_webpack_module, exports) => {


var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;


/***/ }),

/***/ 9385:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/* eslint-disable no-proto -- safe */
var uncurryThisAccessor = __webpack_require__(2743);
var anObject = __webpack_require__(5027);
var aPossiblePrototype = __webpack_require__(3550);

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);


/***/ }),

/***/ 5899:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var call = __webpack_require__(2615);
var isCallable = __webpack_require__(9985);
var isObject = __webpack_require__(8999);

var $TypeError = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
module.exports = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  throw new $TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ 9152:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var getBuiltIn = __webpack_require__(6058);
var uncurryThis = __webpack_require__(8844);
var getOwnPropertyNamesModule = __webpack_require__(2741);
var getOwnPropertySymbolsModule = __webpack_require__(7518);
var anObject = __webpack_require__(5027);

var concat = uncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ 8055:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var defineProperty = (__webpack_require__(2560).f);

module.exports = function (Target, Source, key) {
  key in Target || defineProperty(Target, key, {
    configurable: true,
    get: function () { return Source[key]; },
    set: function (it) { Source[key] = it; }
  });
};


/***/ }),

/***/ 6100:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var call = __webpack_require__(2615);
var anObject = __webpack_require__(5027);
var isCallable = __webpack_require__(9985);
var classof = __webpack_require__(6648);
var regexpExec = __webpack_require__(6308);

var $TypeError = TypeError;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (isCallable(exec)) {
    var result = call(exec, R, S);
    if (result !== null) anObject(result);
    return result;
  }
  if (classof(R) === 'RegExp') return call(regexpExec, R, S);
  throw new $TypeError('RegExp#exec called on incompatible receiver');
};


/***/ }),

/***/ 6308:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */
var call = __webpack_require__(2615);
var uncurryThis = __webpack_require__(8844);
var toString = __webpack_require__(4327);
var regexpFlags = __webpack_require__(9633);
var stickyHelpers = __webpack_require__(7901);
var shared = __webpack_require__(3430);
var create = __webpack_require__(5391);
var getInternalState = (__webpack_require__(618).get);
var UNSUPPORTED_DOT_ALL = __webpack_require__(2100);
var UNSUPPORTED_NCG = __webpack_require__(6422);

var nativeReplace = shared('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt = uncurryThis(''.charAt);
var indexOf = uncurryThis(''.indexOf);
var replace = uncurryThis(''.replace);
var stringSlice = uncurryThis(''.slice);

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  call(nativeExec, re1, 'a');
  call(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;

if (PATCH) {
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState(re);
    var str = toString(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match, i, object, group;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = call(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }

    var groups = state.groups;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = call(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace(flags, 'y', '');
      if (indexOf(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt(str, re.lastIndex - 1) !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = call(nativeExec, sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = stringSlice(match.input, charsAdded);
        match[0] = stringSlice(match[0], charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
      call(nativeReplace, match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) {
      match.groups = object = create(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match[group[1]];
      }
    }

    return match;
  };
}

module.exports = patchedExec;


/***/ }),

/***/ 9633:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var anObject = __webpack_require__(5027);

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.hasIndices) result += 'd';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.unicodeSets) result += 'v';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),

/***/ 7901:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var fails = __webpack_require__(3689);
var global = __webpack_require__(9037);

// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
var $RegExp = global.RegExp;

var UNSUPPORTED_Y = fails(function () {
  var re = $RegExp('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') !== null;
});

// UC Browser bug
// https://github.com/zloirock/core-js/issues/1008
var MISSED_STICKY = UNSUPPORTED_Y || fails(function () {
  return !$RegExp('a', 'y').sticky;
});

var BROKEN_CARET = UNSUPPORTED_Y || fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = $RegExp('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') !== null;
});

module.exports = {
  BROKEN_CARET: BROKEN_CARET,
  MISSED_STICKY: MISSED_STICKY,
  UNSUPPORTED_Y: UNSUPPORTED_Y
};


/***/ }),

/***/ 2100:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var fails = __webpack_require__(3689);
var global = __webpack_require__(9037);

// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
var $RegExp = global.RegExp;

module.exports = fails(function () {
  var re = $RegExp('.', 's');
  return !(re.dotAll && re.test('\n') && re.flags === 's');
});


/***/ }),

/***/ 6422:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var fails = __webpack_require__(3689);
var global = __webpack_require__(9037);

// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
var $RegExp = global.RegExp;

module.exports = fails(function () {
  var re = $RegExp('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});


/***/ }),

/***/ 4684:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var isNullOrUndefined = __webpack_require__(981);

var $TypeError = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ 5997:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var defineProperty = (__webpack_require__(2560).f);
var hasOwn = __webpack_require__(6812);
var wellKnownSymbol = __webpack_require__(4201);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwn(target, TO_STRING_TAG)) {
    defineProperty(target, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};


/***/ }),

/***/ 2713:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var shared = __webpack_require__(3430);
var uid = __webpack_require__(4630);

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ 4091:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var global = __webpack_require__(9037);
var defineGlobalProperty = __webpack_require__(5014);

var SHARED = '__core-js_shared__';
var store = global[SHARED] || defineGlobalProperty(SHARED, {});

module.exports = store;


/***/ }),

/***/ 3430:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var IS_PURE = __webpack_require__(3931);
var store = __webpack_require__(4091);

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.35.1',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2014-2024 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.35.1/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});


/***/ }),

/***/ 730:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);
var toIntegerOrInfinity = __webpack_require__(8700);
var toString = __webpack_require__(4327);
var requireObjectCoercible = __webpack_require__(4684);

var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var stringSlice = uncurryThis(''.slice);

var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString(requireObjectCoercible($this));
    var position = toIntegerOrInfinity(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};


/***/ }),

/***/ 5984:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var PROPER_FUNCTION_NAME = (__webpack_require__(1236).PROPER);
var fails = __webpack_require__(3689);
var whitespaces = __webpack_require__(6350);

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
module.exports = function (METHOD_NAME) {
  return fails(function () {
    return !!whitespaces[METHOD_NAME]()
      || non[METHOD_NAME]() !== non
      || (PROPER_FUNCTION_NAME && whitespaces[METHOD_NAME].name !== METHOD_NAME);
  });
};


/***/ }),

/***/ 1435:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);
var requireObjectCoercible = __webpack_require__(4684);
var toString = __webpack_require__(4327);
var whitespaces = __webpack_require__(6350);

var replace = uncurryThis(''.replace);
var ltrim = RegExp('^[' + whitespaces + ']+');
var rtrim = RegExp('(^|[^' + whitespaces + '])[' + whitespaces + ']+$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod = function (TYPE) {
  return function ($this) {
    var string = toString(requireObjectCoercible($this));
    if (TYPE & 1) string = replace(string, ltrim, '');
    if (TYPE & 2) string = replace(string, rtrim, '$1');
    return string;
  };
};

module.exports = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod(3)
};


/***/ }),

/***/ 146:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = __webpack_require__(3615);
var fails = __webpack_require__(3689);
var global = __webpack_require__(9037);

var $String = global.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});


/***/ }),

/***/ 7578:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var toIntegerOrInfinity = __webpack_require__(8700);

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),

/***/ 5290:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(4413);
var requireObjectCoercible = __webpack_require__(4684);

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ 8700:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var trunc = __webpack_require__(8828);

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};


/***/ }),

/***/ 3126:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var toIntegerOrInfinity = __webpack_require__(8700);

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  var len = toIntegerOrInfinity(argument);
  return len > 0 ? min(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ 690:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var requireObjectCoercible = __webpack_require__(4684);

var $Object = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
module.exports = function (argument) {
  return $Object(requireObjectCoercible(argument));
};


/***/ }),

/***/ 8732:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var call = __webpack_require__(2615);
var isObject = __webpack_require__(8999);
var isSymbol = __webpack_require__(734);
var getMethod = __webpack_require__(4849);
var ordinaryToPrimitive = __webpack_require__(5899);
var wellKnownSymbol = __webpack_require__(4201);

var $TypeError = TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
module.exports = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call(exoticToPrim, input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw new $TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};


/***/ }),

/***/ 8360:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var toPrimitive = __webpack_require__(8732);
var isSymbol = __webpack_require__(734);

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};


/***/ }),

/***/ 3043:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var wellKnownSymbol = __webpack_require__(4201);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';


/***/ }),

/***/ 4327:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var classof = __webpack_require__(926);

var $String = String;

module.exports = function (argument) {
  if (classof(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
  return $String(argument);
};


/***/ }),

/***/ 1905:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var IS_NODE = __webpack_require__(806);

module.exports = function (name) {
  try {
    // eslint-disable-next-line no-new-func -- safe
    if (IS_NODE) return Function('return require("' + name + '")')();
  } catch (error) { /* empty */ }
};


/***/ }),

/***/ 3691:
/***/ ((module) => {


var $String = String;

module.exports = function (argument) {
  try {
    return $String(argument);
  } catch (error) {
    return 'Object';
  }
};


/***/ }),

/***/ 4630:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var uncurryThis = __webpack_require__(8844);

var id = 0;
var postfix = Math.random();
var toString = uncurryThis(1.0.toString);

module.exports = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};


/***/ }),

/***/ 9525:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = __webpack_require__(146);

module.exports = NATIVE_SYMBOL
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';


/***/ }),

/***/ 5648:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var DESCRIPTORS = __webpack_require__(7697);
var fails = __webpack_require__(3689);

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
module.exports = DESCRIPTORS && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});


/***/ }),

/***/ 9834:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var global = __webpack_require__(9037);
var isCallable = __webpack_require__(9985);

var WeakMap = global.WeakMap;

module.exports = isCallable(WeakMap) && /native code/.test(String(WeakMap));


/***/ }),

/***/ 4201:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var global = __webpack_require__(9037);
var shared = __webpack_require__(3430);
var hasOwn = __webpack_require__(6812);
var uid = __webpack_require__(4630);
var NATIVE_SYMBOL = __webpack_require__(146);
var USE_SYMBOL_AS_UID = __webpack_require__(9525);

var Symbol = global.Symbol;
var WellKnownSymbolsStore = shared('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol['for'] || Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!hasOwn(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name)
      ? Symbol[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};


/***/ }),

/***/ 6350:
/***/ ((module) => {


// a string of all valid unicode whitespaces
module.exports = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';


/***/ }),

/***/ 1064:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var getBuiltIn = __webpack_require__(6058);
var hasOwn = __webpack_require__(6812);
var createNonEnumerableProperty = __webpack_require__(5773);
var isPrototypeOf = __webpack_require__(3622);
var setPrototypeOf = __webpack_require__(9385);
var copyConstructorProperties = __webpack_require__(8758);
var proxyAccessor = __webpack_require__(8055);
var inheritIfRequired = __webpack_require__(3457);
var normalizeStringArgument = __webpack_require__(3841);
var installErrorCause = __webpack_require__(2570);
var installErrorStack = __webpack_require__(5411);
var DESCRIPTORS = __webpack_require__(7697);
var IS_PURE = __webpack_require__(3931);

module.exports = function (FULL_NAME, wrapper, FORCED, IS_AGGREGATE_ERROR) {
  var STACK_TRACE_LIMIT = 'stackTraceLimit';
  var OPTIONS_POSITION = IS_AGGREGATE_ERROR ? 2 : 1;
  var path = FULL_NAME.split('.');
  var ERROR_NAME = path[path.length - 1];
  var OriginalError = getBuiltIn.apply(null, path);

  if (!OriginalError) return;

  var OriginalErrorPrototype = OriginalError.prototype;

  // V8 9.3- bug https://bugs.chromium.org/p/v8/issues/detail?id=12006
  if (!IS_PURE && hasOwn(OriginalErrorPrototype, 'cause')) delete OriginalErrorPrototype.cause;

  if (!FORCED) return OriginalError;

  var BaseError = getBuiltIn('Error');

  var WrappedError = wrapper(function (a, b) {
    var message = normalizeStringArgument(IS_AGGREGATE_ERROR ? b : a, undefined);
    var result = IS_AGGREGATE_ERROR ? new OriginalError(a) : new OriginalError();
    if (message !== undefined) createNonEnumerableProperty(result, 'message', message);
    installErrorStack(result, WrappedError, result.stack, 2);
    if (this && isPrototypeOf(OriginalErrorPrototype, this)) inheritIfRequired(result, this, WrappedError);
    if (arguments.length > OPTIONS_POSITION) installErrorCause(result, arguments[OPTIONS_POSITION]);
    return result;
  });

  WrappedError.prototype = OriginalErrorPrototype;

  if (ERROR_NAME !== 'Error') {
    if (setPrototypeOf) setPrototypeOf(WrappedError, BaseError);
    else copyConstructorProperties(WrappedError, BaseError, { name: true });
  } else if (DESCRIPTORS && STACK_TRACE_LIMIT in OriginalError) {
    proxyAccessor(WrappedError, OriginalError, STACK_TRACE_LIMIT);
    proxyAccessor(WrappedError, OriginalError, 'prepareStackTrace');
  }

  copyConstructorProperties(WrappedError, OriginalError);

  if (!IS_PURE) try {
    // Safari 13- bug: WebAssembly errors does not have a proper `.name`
    if (OriginalErrorPrototype.name !== ERROR_NAME) {
      createNonEnumerableProperty(OriginalErrorPrototype, 'name', ERROR_NAME);
    }
    OriginalErrorPrototype.constructor = WrappedError;
  } catch (error) { /* empty */ }

  return WrappedError;
};


/***/ }),

/***/ 560:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $ = __webpack_require__(9989);
var toObject = __webpack_require__(690);
var lengthOfArrayLike = __webpack_require__(6310);
var setArrayLength = __webpack_require__(5649);
var doesNotExceedSafeInteger = __webpack_require__(5565);
var fails = __webpack_require__(3689);

var INCORRECT_TO_LENGTH = fails(function () {
  return [].push.call({ length: 0x100000000 }, 1) !== 4294967297;
});

// V8 <= 121 and Safari <= 15.4; FF < 23 throws InternalError
// https://bugs.chromium.org/p/v8/issues/detail?id=12681
var properErrorOnNonWritableLength = function () {
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).push();
  } catch (error) {
    return error instanceof TypeError;
  }
};

var FORCED = INCORRECT_TO_LENGTH || !properErrorOnNonWritableLength();

// `Array.prototype.push` method
// https://tc39.es/ecma262/#sec-array.prototype.push
$({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  push: function push(item) {
    var O = toObject(this);
    var len = lengthOfArrayLike(O);
    var argCount = arguments.length;
    doesNotExceedSafeInteger(len + argCount);
    for (var i = 0; i < argCount; i++) {
      O[len] = arguments[i];
      len++;
    }
    setArrayLength(O, len);
    return len;
  }
});


/***/ }),

/***/ 5137:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $ = __webpack_require__(9989);
var uncurryThis = __webpack_require__(8844);
var aCallable = __webpack_require__(509);
var toObject = __webpack_require__(690);
var lengthOfArrayLike = __webpack_require__(6310);
var deletePropertyOrThrow = __webpack_require__(8494);
var toString = __webpack_require__(4327);
var fails = __webpack_require__(3689);
var internalSort = __webpack_require__(382);
var arrayMethodIsStrict = __webpack_require__(6834);
var FF = __webpack_require__(7365);
var IE_OR_EDGE = __webpack_require__(7298);
var V8 = __webpack_require__(3615);
var WEBKIT = __webpack_require__(7922);

var test = [];
var nativeSort = uncurryThis(test.sort);
var push = uncurryThis(test.push);

// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict('sort');

var STABLE_SORT = !fails(function () {
  // feature detection can be too slow, so check engines versions
  if (V8) return V8 < 70;
  if (FF && FF > 3) return;
  if (IE_OR_EDGE) return true;
  if (WEBKIT) return WEBKIT < 603;

  var result = '';
  var code, chr, value, index;

  // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
  for (code = 65; code < 76; code++) {
    chr = String.fromCharCode(code);

    switch (code) {
      case 66: case 69: case 70: case 72: value = 3; break;
      case 68: case 71: value = 4; break;
      default: value = 2;
    }

    for (index = 0; index < 47; index++) {
      test.push({ k: chr + index, v: value });
    }
  }

  test.sort(function (a, b) { return b.v - a.v; });

  for (index = 0; index < test.length; index++) {
    chr = test[index].k.charAt(0);
    if (result.charAt(result.length - 1) !== chr) result += chr;
  }

  return result !== 'DGBEFHACIJK';
});

var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD || !STABLE_SORT;

var getSortCompare = function (comparefn) {
  return function (x, y) {
    if (y === undefined) return -1;
    if (x === undefined) return 1;
    if (comparefn !== undefined) return +comparefn(x, y) || 0;
    return toString(x) > toString(y) ? 1 : -1;
  };
};

// `Array.prototype.sort` method
// https://tc39.es/ecma262/#sec-array.prototype.sort
$({ target: 'Array', proto: true, forced: FORCED }, {
  sort: function sort(comparefn) {
    if (comparefn !== undefined) aCallable(comparefn);

    var array = toObject(this);

    if (STABLE_SORT) return comparefn === undefined ? nativeSort(array) : nativeSort(array, comparefn);

    var items = [];
    var arrayLength = lengthOfArrayLike(array);
    var itemsLength, index;

    for (index = 0; index < arrayLength; index++) {
      if (index in array) push(items, array[index]);
    }

    internalSort(items, getSortCompare(comparefn));

    itemsLength = lengthOfArrayLike(items);
    index = 0;

    while (index < itemsLength) array[index] = items[index++];
    while (index < arrayLength) deletePropertyOrThrow(array, index++);

    return array;
  }
});


/***/ }),

/***/ 1057:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


/* eslint-disable no-unused-vars -- required for functions `.length` */
var $ = __webpack_require__(9989);
var global = __webpack_require__(9037);
var apply = __webpack_require__(1735);
var wrapErrorConstructorWithCause = __webpack_require__(1064);

var WEB_ASSEMBLY = 'WebAssembly';
var WebAssembly = global[WEB_ASSEMBLY];

// eslint-disable-next-line es/no-error-cause -- feature detection
var FORCED = new Error('e', { cause: 7 }).cause !== 7;

var exportGlobalErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  var O = {};
  O[ERROR_NAME] = wrapErrorConstructorWithCause(ERROR_NAME, wrapper, FORCED);
  $({ global: true, constructor: true, arity: 1, forced: FORCED }, O);
};

var exportWebAssemblyErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  if (WebAssembly && WebAssembly[ERROR_NAME]) {
    var O = {};
    O[ERROR_NAME] = wrapErrorConstructorWithCause(WEB_ASSEMBLY + '.' + ERROR_NAME, wrapper, FORCED);
    $({ target: WEB_ASSEMBLY, stat: true, constructor: true, arity: 1, forced: FORCED }, O);
  }
};

// https://tc39.es/ecma262/#sec-nativeerror
exportGlobalErrorCauseWrapper('Error', function (init) {
  return function Error(message) { return apply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('EvalError', function (init) {
  return function EvalError(message) { return apply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('RangeError', function (init) {
  return function RangeError(message) { return apply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('ReferenceError', function (init) {
  return function ReferenceError(message) { return apply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('SyntaxError', function (init) {
  return function SyntaxError(message) { return apply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('TypeError', function (init) {
  return function TypeError(message) { return apply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('URIError', function (init) {
  return function URIError(message) { return apply(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('CompileError', function (init) {
  return function CompileError(message) { return apply(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('LinkError', function (init) {
  return function LinkError(message) { return apply(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('RuntimeError', function (init) {
  return function RuntimeError(message) { return apply(init, this, arguments); };
});


/***/ }),

/***/ 4043:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $ = __webpack_require__(9989);
var exec = __webpack_require__(6308);

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
$({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});


/***/ }),

/***/ 7409:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


// TODO: Remove from `core-js@4` since it's moved to entry points
__webpack_require__(4043);
var $ = __webpack_require__(9989);
var call = __webpack_require__(2615);
var isCallable = __webpack_require__(9985);
var anObject = __webpack_require__(5027);
var toString = __webpack_require__(4327);

var DELEGATES_TO_EXEC = function () {
  var execCalled = false;
  var re = /[ac]/;
  re.exec = function () {
    execCalled = true;
    return /./.exec.apply(this, arguments);
  };
  return re.test('abc') === true && execCalled;
}();

var nativeTest = /./.test;

// `RegExp.prototype.test` method
// https://tc39.es/ecma262/#sec-regexp.prototype.test
$({ target: 'RegExp', proto: true, forced: !DELEGATES_TO_EXEC }, {
  test: function (S) {
    var R = anObject(this);
    var string = toString(S);
    var exec = R.exec;
    if (!isCallable(exec)) return call(nativeTest, R, string);
    var result = call(exec, R, string);
    if (result === null) return false;
    anObject(result);
    return true;
  }
});


/***/ }),

/***/ 7267:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var apply = __webpack_require__(1735);
var call = __webpack_require__(2615);
var uncurryThis = __webpack_require__(8844);
var fixRegExpWellKnownSymbolLogic = __webpack_require__(8678);
var fails = __webpack_require__(3689);
var anObject = __webpack_require__(5027);
var isCallable = __webpack_require__(9985);
var isNullOrUndefined = __webpack_require__(981);
var toIntegerOrInfinity = __webpack_require__(8700);
var toLength = __webpack_require__(3126);
var toString = __webpack_require__(4327);
var requireObjectCoercible = __webpack_require__(4684);
var advanceStringIndex = __webpack_require__(1514);
var getMethod = __webpack_require__(4849);
var getSubstitution = __webpack_require__(7017);
var regExpExec = __webpack_require__(6100);
var wellKnownSymbol = __webpack_require__(4201);

var REPLACE = wellKnownSymbol('replace');
var max = Math.max;
var min = Math.min;
var concat = uncurryThis([].concat);
var push = uncurryThis([].push);
var stringIndexOf = uncurryThis(''.indexOf);
var stringSlice = uncurryThis(''.slice);

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
  return 'a'.replace(/./, '$0') === '$0';
})();

// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
  return ''.replace(re, '$<a>') !== '7';
});

// @@replace logic
fixRegExpWellKnownSymbolLogic('replace', function (_, nativeReplace, maybeCallNative) {
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = isNullOrUndefined(searchValue) ? undefined : getMethod(searchValue, REPLACE);
      return replacer
        ? call(replacer, searchValue, O, replaceValue)
        : call(nativeReplace, toString(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (string, replaceValue) {
      var rx = anObject(this);
      var S = toString(string);

      if (
        typeof replaceValue == 'string' &&
        stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
        stringIndexOf(replaceValue, '$<') === -1
      ) {
        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
        if (res.done) return res.value;
      }

      var functionalReplace = isCallable(replaceValue);
      if (!functionalReplace) replaceValue = toString(replaceValue);

      var global = rx.global;
      var fullUnicode;
      if (global) {
        fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }

      var results = [];
      var result;
      while (true) {
        result = regExpExec(rx, S);
        if (result === null) break;

        push(results, result);
        if (!global) break;

        var matchStr = toString(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = toString(result[0]);
        var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
        var captures = [];
        var replacement;
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) push(captures, maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = concat([matched], captures, position, S);
          if (namedCaptures !== undefined) push(replacerArgs, namedCaptures);
          replacement = toString(apply(replaceValue, undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }

      return accumulatedResult + stringSlice(S, nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);


/***/ }),

/***/ 8436:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $ = __webpack_require__(9989);
var $trim = (__webpack_require__(1435).trim);
var forcedStringTrimMethod = __webpack_require__(5984);

// `String.prototype.trim` method
// https://tc39.es/ecma262/#sec-string.prototype.trim
$({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});


/***/ }),

/***/ 7337:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $ = __webpack_require__(9989);
var tryNodeRequire = __webpack_require__(1905);
var getBuiltIn = __webpack_require__(6058);
var fails = __webpack_require__(3689);
var create = __webpack_require__(5391);
var createPropertyDescriptor = __webpack_require__(5684);
var defineProperty = (__webpack_require__(2560).f);
var defineBuiltIn = __webpack_require__(1880);
var defineBuiltInAccessor = __webpack_require__(2148);
var hasOwn = __webpack_require__(6812);
var anInstance = __webpack_require__(767);
var anObject = __webpack_require__(5027);
var errorToString = __webpack_require__(445);
var normalizeStringArgument = __webpack_require__(3841);
var DOMExceptionConstants = __webpack_require__(7136);
var clearErrorStack = __webpack_require__(6610);
var InternalStateModule = __webpack_require__(618);
var DESCRIPTORS = __webpack_require__(7697);
var IS_PURE = __webpack_require__(3931);

var DOM_EXCEPTION = 'DOMException';
var DATA_CLONE_ERR = 'DATA_CLONE_ERR';
var Error = getBuiltIn('Error');
// NodeJS < 17.0 does not expose `DOMException` to global
var NativeDOMException = getBuiltIn(DOM_EXCEPTION) || (function () {
  try {
    // NodeJS < 15.0 does not expose `MessageChannel` to global
    var MessageChannel = getBuiltIn('MessageChannel') || tryNodeRequire('worker_threads').MessageChannel;
    // eslint-disable-next-line es/no-weak-map, unicorn/require-post-message-target-origin -- safe
    new MessageChannel().port1.postMessage(new WeakMap());
  } catch (error) {
    if (error.name === DATA_CLONE_ERR && error.code === 25) return error.constructor;
  }
})();
var NativeDOMExceptionPrototype = NativeDOMException && NativeDOMException.prototype;
var ErrorPrototype = Error.prototype;
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(DOM_EXCEPTION);
var HAS_STACK = 'stack' in new Error(DOM_EXCEPTION);

var codeFor = function (name) {
  return hasOwn(DOMExceptionConstants, name) && DOMExceptionConstants[name].m ? DOMExceptionConstants[name].c : 0;
};

var $DOMException = function DOMException() {
  anInstance(this, DOMExceptionPrototype);
  var argumentsLength = arguments.length;
  var message = normalizeStringArgument(argumentsLength < 1 ? undefined : arguments[0]);
  var name = normalizeStringArgument(argumentsLength < 2 ? undefined : arguments[1], 'Error');
  var code = codeFor(name);
  setInternalState(this, {
    type: DOM_EXCEPTION,
    name: name,
    message: message,
    code: code
  });
  if (!DESCRIPTORS) {
    this.name = name;
    this.message = message;
    this.code = code;
  }
  if (HAS_STACK) {
    var error = new Error(message);
    error.name = DOM_EXCEPTION;
    defineProperty(this, 'stack', createPropertyDescriptor(1, clearErrorStack(error.stack, 1)));
  }
};

var DOMExceptionPrototype = $DOMException.prototype = create(ErrorPrototype);

var createGetterDescriptor = function (get) {
  return { enumerable: true, configurable: true, get: get };
};

var getterFor = function (key) {
  return createGetterDescriptor(function () {
    return getInternalState(this)[key];
  });
};

if (DESCRIPTORS) {
  // `DOMException.prototype.code` getter
  defineBuiltInAccessor(DOMExceptionPrototype, 'code', getterFor('code'));
  // `DOMException.prototype.message` getter
  defineBuiltInAccessor(DOMExceptionPrototype, 'message', getterFor('message'));
  // `DOMException.prototype.name` getter
  defineBuiltInAccessor(DOMExceptionPrototype, 'name', getterFor('name'));
}

defineProperty(DOMExceptionPrototype, 'constructor', createPropertyDescriptor(1, $DOMException));

// FF36- DOMException is a function, but can't be constructed
var INCORRECT_CONSTRUCTOR = fails(function () {
  return !(new NativeDOMException() instanceof Error);
});

// Safari 10.1 / Chrome 32- / IE8- DOMException.prototype.toString bugs
var INCORRECT_TO_STRING = INCORRECT_CONSTRUCTOR || fails(function () {
  return ErrorPrototype.toString !== errorToString || String(new NativeDOMException(1, 2)) !== '2: 1';
});

// Deno 1.6.3- DOMException.prototype.code just missed
var INCORRECT_CODE = INCORRECT_CONSTRUCTOR || fails(function () {
  return new NativeDOMException(1, 'DataCloneError').code !== 25;
});

// Deno 1.6.3- DOMException constants just missed
var MISSED_CONSTANTS = INCORRECT_CONSTRUCTOR
  || NativeDOMException[DATA_CLONE_ERR] !== 25
  || NativeDOMExceptionPrototype[DATA_CLONE_ERR] !== 25;

var FORCED_CONSTRUCTOR = IS_PURE ? INCORRECT_TO_STRING || INCORRECT_CODE || MISSED_CONSTANTS : INCORRECT_CONSTRUCTOR;

// `DOMException` constructor
// https://webidl.spec.whatwg.org/#idl-DOMException
$({ global: true, constructor: true, forced: FORCED_CONSTRUCTOR }, {
  DOMException: FORCED_CONSTRUCTOR ? $DOMException : NativeDOMException
});

var PolyfilledDOMException = getBuiltIn(DOM_EXCEPTION);
var PolyfilledDOMExceptionPrototype = PolyfilledDOMException.prototype;

if (INCORRECT_TO_STRING && (IS_PURE || NativeDOMException === PolyfilledDOMException)) {
  defineBuiltIn(PolyfilledDOMExceptionPrototype, 'toString', errorToString);
}

if (INCORRECT_CODE && DESCRIPTORS && NativeDOMException === PolyfilledDOMException) {
  defineBuiltInAccessor(PolyfilledDOMExceptionPrototype, 'code', createGetterDescriptor(function () {
    return codeFor(anObject(this).name);
  }));
}

// `DOMException` constants
for (var key in DOMExceptionConstants) if (hasOwn(DOMExceptionConstants, key)) {
  var constant = DOMExceptionConstants[key];
  var constantName = constant.s;
  var descriptor = createPropertyDescriptor(6, constant.c);
  if (!hasOwn(PolyfilledDOMException, constantName)) {
    defineProperty(PolyfilledDOMException, constantName, descriptor);
  }
  if (!hasOwn(PolyfilledDOMExceptionPrototype, constantName)) {
    defineProperty(PolyfilledDOMExceptionPrototype, constantName, descriptor);
  }
}


/***/ }),

/***/ 3429:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $ = __webpack_require__(9989);
var global = __webpack_require__(9037);
var getBuiltIn = __webpack_require__(6058);
var createPropertyDescriptor = __webpack_require__(5684);
var defineProperty = (__webpack_require__(2560).f);
var hasOwn = __webpack_require__(6812);
var anInstance = __webpack_require__(767);
var inheritIfRequired = __webpack_require__(3457);
var normalizeStringArgument = __webpack_require__(3841);
var DOMExceptionConstants = __webpack_require__(7136);
var clearErrorStack = __webpack_require__(6610);
var DESCRIPTORS = __webpack_require__(7697);
var IS_PURE = __webpack_require__(3931);

var DOM_EXCEPTION = 'DOMException';
var Error = getBuiltIn('Error');
var NativeDOMException = getBuiltIn(DOM_EXCEPTION);

var $DOMException = function DOMException() {
  anInstance(this, DOMExceptionPrototype);
  var argumentsLength = arguments.length;
  var message = normalizeStringArgument(argumentsLength < 1 ? undefined : arguments[0]);
  var name = normalizeStringArgument(argumentsLength < 2 ? undefined : arguments[1], 'Error');
  var that = new NativeDOMException(message, name);
  var error = new Error(message);
  error.name = DOM_EXCEPTION;
  defineProperty(that, 'stack', createPropertyDescriptor(1, clearErrorStack(error.stack, 1)));
  inheritIfRequired(that, this, $DOMException);
  return that;
};

var DOMExceptionPrototype = $DOMException.prototype = NativeDOMException.prototype;

var ERROR_HAS_STACK = 'stack' in new Error(DOM_EXCEPTION);
var DOM_EXCEPTION_HAS_STACK = 'stack' in new NativeDOMException(1, 2);

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var descriptor = NativeDOMException && DESCRIPTORS && Object.getOwnPropertyDescriptor(global, DOM_EXCEPTION);

// Bun ~ 0.1.1 DOMException have incorrect descriptor and we can't redefine it
// https://github.com/Jarred-Sumner/bun/issues/399
var BUGGY_DESCRIPTOR = !!descriptor && !(descriptor.writable && descriptor.configurable);

var FORCED_CONSTRUCTOR = ERROR_HAS_STACK && !BUGGY_DESCRIPTOR && !DOM_EXCEPTION_HAS_STACK;

// `DOMException` constructor patch for `.stack` where it's required
// https://webidl.spec.whatwg.org/#es-DOMException-specialness
$({ global: true, constructor: true, forced: IS_PURE || FORCED_CONSTRUCTOR }, { // TODO: fix export logic
  DOMException: FORCED_CONSTRUCTOR ? $DOMException : NativeDOMException
});

var PolyfilledDOMException = getBuiltIn(DOM_EXCEPTION);
var PolyfilledDOMExceptionPrototype = PolyfilledDOMException.prototype;

if (PolyfilledDOMExceptionPrototype.constructor !== PolyfilledDOMException) {
  if (!IS_PURE) {
    defineProperty(PolyfilledDOMExceptionPrototype, 'constructor', createPropertyDescriptor(1, PolyfilledDOMException));
  }

  for (var key in DOMExceptionConstants) if (hasOwn(DOMExceptionConstants, key)) {
    var constant = DOMExceptionConstants[key];
    var constantName = constant.s;
    if (!hasOwn(PolyfilledDOMException, constantName)) {
      defineProperty(PolyfilledDOMException, constantName, createPropertyDescriptor(6, constant.c));
    }
  }
}


/***/ }),

/***/ 7462:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var getBuiltIn = __webpack_require__(6058);
var setToStringTag = __webpack_require__(5997);

var DOM_EXCEPTION = 'DOMException';

// `DOMException.prototype[@@toStringTag]` property
setToStringTag(getBuiltIn(DOM_EXCEPTION), DOM_EXCEPTION);


/***/ }),

/***/ 3650:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $ = __webpack_require__(9989);
var global = __webpack_require__(9037);
var defineBuiltInAccessor = __webpack_require__(2148);
var DESCRIPTORS = __webpack_require__(7697);

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var INCORRECT_VALUE = global.self !== global;

// `self` getter
// https://html.spec.whatwg.org/multipage/window-object.html#dom-self
try {
  if (DESCRIPTORS) {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var descriptor = Object.getOwnPropertyDescriptor(global, 'self');
    // some engines have `self`, but with incorrect descriptor
    // https://github.com/denoland/deno/issues/15765
    if (INCORRECT_VALUE || !descriptor || !descriptor.get || !descriptor.enumerable) {
      defineBuiltInAccessor(global, 'self', {
        get: function self() {
          return global;
        },
        set: function self(value) {
          if (this !== global) throw new $TypeError('Illegal invocation');
          defineProperty(global, 'self', {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true
          });
        },
        configurable: true,
        enumerable: true
      });
    }
  } else $({ global: true, simple: true, forced: INCORRECT_VALUE }, {
    self: global
  });
} catch (error) { /* empty */ }


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.regexp.exec.js
var es_regexp_exec = __webpack_require__(4043);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.regexp.test.js
var es_regexp_test = __webpack_require__(7409);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.push.js
var es_array_push = __webpack_require__(560);
// EXTERNAL MODULE: ./node_modules/core-js/modules/web.self.js
var web_self = __webpack_require__(3650);
;// CONCATENATED MODULE: ./node_modules/@mrhenry/core-web/modules/~element-qsa-scope.js




/**
 * @license
 * Author : https://github.com/jonathantneal
 * https://github.com/jonathantneal/element-qsa-scope/blob/master/LICENSE.md
 * # CC0 1.0 Universal License
 * Public Domain Dedication
 * The person(s) who associated a work with this deed has dedicated the work to the public domain by waiving all of his or her rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law.
 * You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.
 * In no way are the patent or trademark rights of any person affected by CC0, nor are the rights that other persons may have in the work or in how the work is used, such as publicity or privacy rights.
 * Unless expressly stated otherwise, the person(s) who associated a work with this deed makes no warranties about the work, and disclaims liability for all uses of the work, to the fullest extent permitted by applicable law.
 * When using or citing the work, you should not imply endorsement by the author or the affirmer.
 * This is a [human-readable summary of the Legal Code](//creativecommons.org/publicdomain/zero/1.0/) ([read the full text](//creativecommons.org/publicdomain/zero/1.0/)).
 */
(function (global) {
  try {
    document.querySelector(':scope *');
  } catch (_) {
    var scopeTest = /:scope(?![\w-])/i;
    var querySelectorWithScope = polyfill(global.Element.prototype.querySelector);
    global.Element.prototype.querySelector = function querySelector(selectors) {
      return querySelectorWithScope.apply(this, arguments);
    };
    var querySelectorAllWithScope = polyfill(global.Element.prototype.querySelectorAll);
    global.Element.prototype.querySelectorAll = function querySelectorAll(selectors) {
      return querySelectorAllWithScope.apply(this, arguments);
    };
    if (global.Element.prototype.matches) {
      var matchesWithScope = polyfill(global.Element.prototype.matches);
      global.Element.prototype.matches = function matches(selectors) {
        return matchesWithScope.apply(this, arguments);
      };
    }
    if (global.Element.prototype.closest) {
      var closestWithScope = polyfill(global.Element.prototype.closest);
      global.Element.prototype.closest = function closest(selectors) {
        return closestWithScope.apply(this, arguments);
      };
    }
    function replaceScopeWithAttr(query, attr) {
      var parts = [];
      var current = '';
      var escaped = false;
      var quoted = false;
      var quotedMark = false;
      var bracketed = 0;
      for (var i = 0; i < query.length; i++) {
        var char = query[i];
        if (escaped) {
          current += char;
          escaped = false;
          continue;
        }
        if (quoted) {
          if (char === quotedMark) {
            quoted = false;
          }
          current += char;
          continue;
        }
        if (current.toLowerCase() === ':scope' && !bracketed && /^[\[\.\:\\"\s|+>~#&,)]/.test(char || '')) {
          parts.push(current.slice(0, current.length - 6));
          parts.push('[' + attr + ']');
          current = '';
        }
        switch (char) {
          case ':':
            parts.push(current);
            current = '';
            current += char;
            continue;
          case '\\':
            current += char;
            escaped = true;
            continue;
          case '"':
          case "'":
            current += char;
            quoted = true;
            quotedMark = char;
            continue;
          case '[':
            current += char;
            bracketed++;
            continue;
          case "]":
            current += char;
            if (bracketed > 0) {
              bracketed--;
            }
            continue;
          default:
            current += char;
            continue;
        }
      }
      if (current.toLowerCase() === ':scope') {
        parts.push(current.slice(0, current.length - 6));
        parts.push('[' + attr + ']');
        current = '';
      }
      if (parts.length === 0) {
        return query;
      }
      return parts.join('') + current;
    }
    function polyfill(qsa) {
      return function (selectors) {
        if (!selectors) {
          return qsa.apply(this, arguments);
        }
        var selectorsString = String(selectors);
        if (!selectorsString || !scopeTest.test(selectorsString)) {
          return qsa.apply(this, arguments);
        }
        var attr = 'q' + (Math.floor(Math.random() * 9000000) + 2000000);
        arguments[0] = replaceScopeWithAttr(selectorsString, attr);
        this.setAttribute(attr, '');
        var elementOrNodeList = qsa.apply(this, arguments);
        this.removeAttribute(attr);
        return elementOrNodeList;
      };
    }
  }
})(self);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.error.cause.js
var es_error_cause = __webpack_require__(1057);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.trim.js
var es_string_trim = __webpack_require__(8436);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.replace.js
var es_string_replace = __webpack_require__(7267);
// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-exception.constructor.js
var web_dom_exception_constructor = __webpack_require__(7337);
// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-exception.stack.js
var web_dom_exception_stack = __webpack_require__(3429);
// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-exception.to-string-tag.js
var web_dom_exception_to_string_tag = __webpack_require__(7462);
;// CONCATENATED MODULE: ./node_modules/@mrhenry/core-web/modules/~element-qsa-has.js










(function (global) {
  try {
    global.document.querySelector(':has(*, :does-not-exist, > *)');
    if (!global.document.querySelector(':has(:scope *)') && CSS.supports('selector(:has(div))')) {
      return;
    }
  } catch (_) {}
  var querySelectorWithHasElement = polyfill(global.Element.prototype.querySelector);
  global.Element.prototype.querySelector = function querySelector(selectors) {
    return querySelectorWithHasElement.apply(this, arguments);
  };
  var querySelectorAllWithHasElement = polyfill(global.Element.prototype.querySelectorAll);
  global.Element.prototype.querySelectorAll = function querySelectorAll(selectors) {
    return querySelectorAllWithHasElement.apply(this, arguments);
  };
  if (global.Element.prototype.matches) {
    var matchesWithHasElement = polyfill(global.Element.prototype.matches);
    global.Element.prototype.matches = function matches(selectors) {
      return matchesWithHasElement.apply(this, arguments);
    };
  }
  if (global.Element.prototype.closest) {
    var closestWithHasElement = polyfill(global.Element.prototype.closest);
    global.Element.prototype.closest = function closest(selectors) {
      return closestWithHasElement.apply(this, arguments);
    };
  }
  if ('Document' in global && 'prototype' in global.Document) {
    var querySelectorWithHasDocument = polyfill(global.Document.prototype.querySelector);
    global.Document.prototype.querySelector = function querySelector(selectors) {
      return querySelectorWithHasDocument.apply(this, arguments);
    };
    var querySelectorAllWithHasDocument = polyfill(global.Document.prototype.querySelectorAll);
    global.Document.prototype.querySelectorAll = function querySelectorAll(selectors) {
      return querySelectorAllWithHasDocument.apply(this, arguments);
    };
    if (global.Document.prototype.matches) {
      var matchesWithHasDocument = polyfill(global.Document.prototype.matches);
      global.Document.prototype.matches = function matches(selectors) {
        return matchesWithHasDocument.apply(this, arguments);
      };
    }
    if (global.Document.prototype.closest) {
      var closestWithHasDocument = polyfill(global.Document.prototype.closest);
      global.Document.prototype.closest = function closest(selectors) {
        return closestWithHasDocument.apply(this, arguments);
      };
    }
  }
  function pseudoClassHasInnerQuery(query) {
    var current = '';
    var start = 0;
    var depth = 0;
    var escaped = false;
    var quoted = false;
    var quotedMark = false;
    var inHas = false;
    var bracketed = 0;
    for (var i = 0; i < query.length; i++) {
      var char = query[i];
      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }
      if (quoted) {
        if (char === quotedMark) {
          quoted = false;
        }
        current += char;
        continue;
      }
      if (current.toLowerCase() === ':has(' && !inHas) {
        inHas = true;
        start = i;
        current = '';
      }
      switch (char) {
        case ':':
          if (!inHas) {
            current = '';
          }
          current += char;
          continue;
        case '(':
          if (inHas) {
            depth++;
          }
          current += char;
          continue;
        case ')':
          if (inHas) {
            if (depth === 0) {
              return {
                innerQuery: current,
                start: start,
                end: i - 1
              };
            }
            depth--;
          }
          current += char;
          continue;
        case '\\':
          current += char;
          escaped = true;
          continue;
        case '"':
        case "'":
          current += char;
          quoted = true;
          quotedMark = char;
          continue;
        case '[':
          current += char;
          bracketed++;
          continue;
        case "]":
          current += char;
          if (bracketed > 0) {
            bracketed--;
          }
          continue;
        default:
          current += char;
          continue;
      }
    }
    return false;
  }
  function replaceScopeWithAttr(query, attr) {
    var parts = [];
    var current = '';
    var escaped = false;
    var quoted = false;
    var quotedMark = false;
    var bracketed = 0;
    for (var i = 0; i < query.length; i++) {
      var char = query[i];
      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }
      if (quoted) {
        if (char === quotedMark) {
          quoted = false;
        }
        current += char;
        continue;
      }
      if (current.toLowerCase() === ':scope' && !bracketed && /^[\[\.\:\\"\s|+>~#&,)]/.test(char || '')) {
        parts.push(current.slice(0, current.length - 6));
        parts.push('[' + attr + ']');
        current = '';
      }
      switch (char) {
        case ':':
          parts.push(current);
          current = '';
          current += char;
          continue;
        case '\\':
          current += char;
          escaped = true;
          continue;
        case '"':
        case "'":
          current += char;
          quoted = true;
          quotedMark = char;
          continue;
        case '[':
          current += char;
          bracketed++;
          continue;
        case "]":
          current += char;
          if (bracketed > 0) {
            bracketed--;
          }
          continue;
        default:
          current += char;
          continue;
      }
    }
    if (current.toLowerCase() === ':scope') {
      parts.push(current.slice(0, current.length - 6));
      parts.push('[' + attr + ']');
      current = '';
    }
    if (parts.length === 0) {
      return query;
    }
    return parts.join('') + current;
  }
  function charIsNestedMarkMirror(char, mark) {
    if (mark === '(' && char === ')') {
      return true;
    }
    if (mark === '[' && char === ']') {
      return true;
    }
    return false;
  }
  function splitSelector(query) {
    var selectors = [];
    var current = '';
    var escaped = false;
    var quoted = false;
    var quotedMark = false;
    var nestedMark = false;
    var nestedDepth = 0;
    for (var i = 0; i < query.length; i++) {
      var char = query[i];
      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }
      switch (char) {
        case ',':
          if (quoted) {
            current += char;
            continue;
          }
          if (nestedDepth > 0) {
            current += char;
            continue;
          }
          selectors.push(current);
          current = '';
          continue;
        case '\\':
          current += char;
          escaped = true;
          continue;
        case '"':
        case "'":
          if (quoted && char === quotedMark) {
            current += char;
            quoted = false;
            continue;
          }
          current += char;
          quoted = true;
          quotedMark = char;
          continue;
        case '(':
        case ')':
        case '[':
        case ']':
          if (quoted) {
            current += char;
            continue;
          }
          if (charIsNestedMarkMirror(char, nestedMark)) {
            current += char;
            nestedDepth--;
            if (nestedDepth === 0) {
              nestedMark = false;
            }
            continue;
          }
          if (char === nestedMark) {
            current += char;
            nestedDepth++;
            continue;
          }
          current += char;
          nestedDepth++;
          nestedMark = char;
          continue;
        default:
          current += char;
          continue;
      }
    }
    selectors.push(current);
    return selectors;
  }
  function replaceAllWithTempAttr(query, nested, callback) {
    var inner = pseudoClassHasInnerQuery(query);
    if (!inner) {
      return query;
    }
    if (nested) {
      return false;
    }
    var innerQuery = inner.innerQuery;
    var attr = 'q-has' + (Math.floor(Math.random() * 9000000) + 1000000);
    var innerReplacement = '[' + attr + ']';
    var x = query;
    if (inner.innerQuery.toLowerCase().indexOf(':has(') > -1) {
      var innerParts = splitSelector(inner.innerQuery);
      var newInnerParts = [];
      for (var i = 0; i < innerParts.length; i++) {
        var innerPart = innerParts[i];
        var innerPartReplaced = replaceAllWithTempAttr(innerPart, true, function () {});
        if (!innerPartReplaced) {
          throw new Error("Nested :has() is not supported");
        } else {
          newInnerParts.push(innerPart);
        }
      }
      var _prefix = x.substring(0, inner.start - 5);
      var _suffix = x.substring(inner.end + 2);
      return _prefix + newInnerParts.join(', ') + _suffix;
    }
    var _prefix = x.substring(0, inner.start - 5);
    var _suffix = x.substring(inner.end + 2);
    x = _prefix + innerReplacement + _suffix;
    callback(innerQuery, attr);
    if (x.toLowerCase().indexOf(':has(') > -1) {
      var y = replaceAllWithTempAttr(x, false, callback);
      if (y) {
        return y;
      }
    }
    return x;
  }
  function walkNode(rootNode, callback) {
    if ('setAttribute' in rootNode && 'querySelector' in rootNode) {
      callback(rootNode);
    }
    if (rootNode.hasChildNodes()) {
      var nodes = rootNode.childNodes;
      for (var i = 0; i < nodes.length; ++i) {
        walkNode(nodes[i], callback);
      }
    }
  }
  function polyfill(qsa) {
    return function (selectors) {
      if (!selectors) {
        return qsa.apply(this, arguments);
      }
      var selectorsString = String(selectors);
      if (!selectorsString || selectorsString.toLowerCase().indexOf(':has(') === -1 || !pseudoClassHasInnerQuery(selectorsString)) {
        return qsa.apply(this, arguments);
      }
      var rootNode;
      if ('getRootNode' in this) {
        rootNode = this.getRootNode();
      } else {
        var r = this;
        while (r) {
          rootNode = r;
          r = r.parentNode;
        }
      }
      var _focus = this;
      if (_focus === global.document) {
        _focus = global.document.documentElement;
      }
      var scopeAttr = 'q-has-scope' + (Math.floor(Math.random() * 9000000) + 1000000);
      _focus.setAttribute(scopeAttr, '');
      try {
        selectorsString = replaceScopeWithAttr(selectorsString, scopeAttr);
        var attrs = [scopeAttr];
        var newQuery = replaceAllWithTempAttr(selectorsString, false, function (inner, attr) {
          attrs.push(attr);
          var selectorParts = splitSelector(inner);
          for (var x = 0; x < selectorParts.length; x++) {
            var selectorPart = selectorParts[x].trim();
            var absoluteSelectorPart = selectorPart;
            if (selectorPart[0] === '>' || selectorPart[0] === '+' || selectorPart[0] === '~') {
              absoluteSelectorPart = selectorPart.slice(1).trim();
            } else {
              absoluteSelectorPart = ':scope ' + selectorPart;
            }
            walkNode(rootNode, function (node) {
              if (!node.querySelector(absoluteSelectorPart)) {
                return;
              }
              switch (selectorPart[0]) {
                case '~':
                case '+':
                  {
                    var siblings = node.childNodes;
                    for (var i = 0; i < siblings.length; i++) {
                      var sibling = siblings[i];
                      if (!('setAttribute' in sibling)) {
                        continue;
                      }
                      var idAttr = 'q-has-id' + (Math.floor(Math.random() * 9000000) + 1000000);
                      sibling.setAttribute(idAttr, '');
                      if (node.querySelector(':scope [' + idAttr + ']' + ' ' + selectorPart)) {
                        sibling.setAttribute(attr, '');
                      }
                      sibling.removeAttribute(idAttr);
                    }
                  }
                  break;
                case '>':
                  {
                    var idAttr = 'q-has-id' + (Math.floor(Math.random() * 9000000) + 1000000);
                    node.setAttribute(idAttr, '');
                    if (node.querySelector(':scope[' + idAttr + ']' + ' ' + selectorPart)) {
                      node.setAttribute(attr, '');
                    }
                    node.removeAttribute(idAttr);
                  }
                  break;
                default:
                  node.setAttribute(attr, '');
                  break;
              }
            });
          }
        });
        arguments[0] = newQuery;
        var elementOrNodeList = qsa.apply(this, arguments);
        _focus.removeAttribute(scopeAttr);
        if (attrs.length > 0) {
          var attrsForQuery = [];
          for (var j = 0; j < attrs.length; j++) {
            attrsForQuery.push('[' + attrs[j] + ']');
          }
          var elements = global.document.querySelectorAll(attrsForQuery.join(','));
          for (var k = 0; k < elements.length; k++) {
            var element = elements[k];
            for (var l = 0; l < attrs.length; l++) {
              element.removeAttribute(attrs[l]);
            }
          }
        }
        return elementOrNodeList;
      } catch (err) {
        _focus.removeAttribute(scopeAttr);
        if (attrs.length > 0) {
          var attrsForQuery = [];
          for (var j = 0; j < attrs.length; j++) {
            attrsForQuery.push('[' + attrs[j] + ']');
          }
          var elements = global.document.querySelectorAll(attrsForQuery.join(','));
          for (var k = 0; k < elements.length; k++) {
            var element = elements[k];
            for (var l = 0; l < attrs.length; l++) {
              element.removeAttribute(attrs[l]);
            }
          }
        }
        var errorMessage = '';
        try {
          qsa.apply(this, [':core-web-does-not-exist']);
        } catch (dummyError) {
          errorMessage = dummyError.message;
          if (errorMessage) {
            errorMessage = errorMessage.replace(':core-web-does-not-exist', selectorsString);
          }
        }
        if (!errorMessage) {
          errorMessage = "Failed to execute 'querySelector' on 'Document': '" + selectorsString + "' is not a valid selector.";
        }
        try {
          throw new DOMException(errorMessage);
        } catch (_) {
          throw new Error(errorMessage);
        }
      }
    };
  }
})(self);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.sort.js
var es_array_sort = __webpack_require__(5137);
;// CONCATENATED MODULE: ./specifications/w3c/selectors/4.5.Relational-Pseudo-Class/test.pure.js







(function (cb) {
  var assert = {
    test: function (message, callback) {
      callback();
    },
    step: function (message) {},
    equal: function (a, b) {
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
          throw new Error('Arrays are not equal');
        }
        for (var i = 0; i < a.length; i++) {
          assert.equal(a[i], b[i]);
        }
        return;
      }
      if (a !== b) {
        throw new Error('Expected A to equal to B');
      }
    },
    ok: function (a) {
      if (!!a) {
        return;
      }
      throw new Error('Expected something truthy for A');
    },
    skip: function () {},
    throws: function (a) {
      var didThrow = false;
      try {
        a();
      } catch (_) {
        didThrow = true;
      }
      if (!didThrow) {
        throw new Error('Expected test to throw');
      }
    }
  };
  function formatElements(elements) {
    var ids = [];
    for (var i = 0; i < elements.length; i++) {
      ids.push(elements[i].id);
    }
    return ids.sort().join(',');
  }
  function testSelectorAllFromMain(assert, selector, expected) {
    assert.step(selector + ' matches expected elements from #main');
    var actual = Array.from(document.getElementById("main").querySelectorAll(selector));
    assert.equal(formatElements(actual), formatElements(expected));
  }
  function testSelectorAllFromScope(assert, scope, selector, expected) {
    assert.step(selector + ' matches expected elements from scope ' + scope.id || scope.tagName);
    var actual = Array.from(scope.querySelectorAll(selector));
    assert.equal(formatElements(actual), formatElements(expected));
  }
  function testSelector(assert, selector, expected) {
    assert.step(selector + ' matches expected element');
    assert.equal(document.getElementById("main").querySelector(selector).id, expected.id);
  }
  function testClosest(assert, node, selector, expected) {
    assert.step('closest(' + selector + ') returns expected element');
    assert.equal(node.closest(selector), expected);
  }
  function testMatches(assert, node, selector, expected) {
    assert.step(selector + ' matches expectedly');
    assert.equal(node.matches(selector), expected);
  }
  function compareSelectorAll(assert, scope, selector1, selector2) {
    var result1 = Array.from(scope.querySelectorAll(selector1));
    var result2 = Array.from(scope.querySelectorAll(selector2));
    assert.step(selector1 + ' and ' + selector2 + ' returns same elements on ' + scope.id);
    assert.equal(formatElements(result1), formatElements(result2));
  }
  var supportsIsQueries = false;
  try {
    document.body.querySelector(":is(div)");
    supportsIsQueries = true;
  } catch (_) {}
  assert.test("is valid selector", function () {
    assert.ok(document.body.querySelector(":has(*)"));
  });
  assert.test("accepts broken selector lists", function () {
    assert.skip(function () {
      document.body.querySelector(":has(*, :does-not-exist)");
    });
  });
  assert.test(":has basic", function () {
    var fixture = document.getElementById("the-fixture");
    fixture.innerHTML = '<main id="main"><div id="a" class="ancestor"><div id="b" class="parent ancestor"><div id="c" class="sibling descendant"><div id="d" class="descendant"></div></div><div id="e" class="target descendant"></div></div><div id="f" class="parent ancestor"><div id="g" class="target descendant"></div></div><div id="h" class="parent ancestor"><div id="i" class="target descendant"></div><div id="j" class="sibling descendant"><div id="k" class="descendant"></div></div></div></div></main>';
    var a = document.getElementById("a");
    var b = document.getElementById("b");
    var c = document.getElementById("c");
    var e = document.getElementById("e");
    var f = document.getElementById("f");
    var g = document.getElementById("g");
    var h = document.getElementById("h");
    var i = document.getElementById("i");
    var j = document.getElementById("j");
    var k = document.getElementById("k");
    testSelectorAllFromMain(assert, ":has(#a)", []);
    testSelectorAllFromMain(assert, ":has(.ancestor)", [a]);
    testSelectorAllFromMain(assert, ":has(.target)", [a, b, f, h]);
    testSelectorAllFromMain(assert, ":has(.descendant)", [a, b, c, f, h, j]);
    testSelectorAllFromMain(assert, ".parent:has(.target)", [b, f, h]);
    testSelectorAllFromMain(assert, ":has(.sibling ~ .target)", [a, b]);
    testSelectorAllFromMain(assert, ".parent:has(.sibling ~ .target)", [b]);
    if (supportsIsQueries) {
      testSelectorAllFromMain(assert, ":has(:is(.target ~ .sibling .descendant))", [a, h, j]);
      testSelectorAllFromMain(assert, ".parent:has(:is(.target ~ .sibling .descendant))", [h]);
    } else {
      assert.step(":has(:is(.target ~ .sibling .descendant)) matches expected elements from #main");
      assert.step(".parent:has(:is(.target ~ .sibling .descendant)) matches expected elements from #main");
    }
    testSelectorAllFromMain(assert, ".sibling:has(.descendant) ~ .target", [e]);
    testSelectorAllFromMain(assert, ":has(> .parent)", [a]);
    testSelectorAllFromMain(assert, ":has(> .target)", [b, f, h]);
    testSelectorAllFromMain(assert, ":has(> .parent, > .target)", [a, b, f, h]);
    testSelectorAllFromMain(assert, ":has(+ #h)", [f]);
    testSelectorAllFromMain(assert, ".parent:has(~ #h)", [b, f]);
    testSelector(assert, ".sibling:has(.descendant)", c);
    testClosest(assert, k, ".ancestor:has(.descendant)", h);
    testMatches(assert, h, ":has(.target ~ .sibling .descendant)", true);
  });
  assert.test(":has argument with explicit scope", function () {
    var fixture = document.getElementById("the-fixture");
    fixture.innerHTML = '<main><div id=d01 class="a"><div id=scope1 class="b"><div id=d02 class="c"><div id=d03 class="c"><div id=d04 class="d"></div></div></div><div id=d05 class="e"></div></div></div><div id=d06><div id=scope2 class="b"><div id=d07 class="c"><div id=d08 class="c"><div id=d09></div></div></div></div></div></div>';
    var scope1 = document.getElementById("scope1");
    var scope2 = document.getElementById("scope2");
    var d02 = document.getElementById("d02");
    var d03 = document.getElementById("d03");
    testSelectorAllFromScope(assert, scope1, ":has(:scope)", []);
    testSelectorAllFromScope(assert, scope1, ":has(:scope .c)", []);
    testSelectorAllFromScope(assert, scope1, ":has(.a :scope)", []);
    testSelectorAllFromScope(assert, scope1, ".a:has(:scope) .c", [d02, d03]);
    testSelectorAllFromScope(assert, scope2, ".a:has(:scope) .c", []);
    if (supportsIsQueries) {
      compareSelectorAll(assert, scope1, ".a:has(:scope) .c", ":is(.a :scope .c)");
      compareSelectorAll(assert, scope2, ".a:has(:scope) .c", ":is(.a :scope .c)");
      testSelectorAllFromScope(assert, scope1, ".c:has(:is(:scope .d))", [d02, d03]);
      compareSelectorAll(assert, scope1, ".c:has(:is(:scope .d))", ":scope .c:has(.d)");
      compareSelectorAll(assert, scope1, ".c:has(:is(:scope .d))", ".c:has(.d)");
      testSelectorAllFromScope(assert, scope2, ".c:has(:is(:scope .d))", []);
      compareSelectorAll(assert, scope2, ".c:has(:is(:scope .d))", ":scope .c:has(.d)");
      compareSelectorAll(assert, scope2, ".c:has(:is(:scope .d))", ".c:has(.d)");
    }
  });
  assert.test(":has matches to uninserted elements", function () {
    var subject = document.createElement("subject");
    subject.innerHTML = "<child></child>";
    testMatches(assert, subject, ":has(child)", true);
    testMatches(assert, subject, ":has(> child)", true);
    subject.innerHTML = "<child><descendant></descendant></child>";
    testMatches(assert, subject, ":has(descendant)", true);
    testMatches(assert, subject, ":has(> descendant)", false);
    subject.innerHTML = "<child></child><direct_sibling></direct_sibling><indirect_sibling></indirect_sibling>";
    testMatches(assert, subject.firstChild, ":has(~ direct_sibling)", true);
    testMatches(assert, subject.firstChild, ":has(+ direct_sibling)", true);
    testMatches(assert, subject.firstChild, ":has(~ indirect_sibling)", true);
    testMatches(assert, subject.firstChild, ":has(+ indirect_sibling)", false);
    testMatches(assert, subject, ":has(*)", true);
    testMatches(assert, subject, ":has(> *)", true);
    testMatches(assert, subject, ":has(~ *)", false);
    testMatches(assert, subject, ":has(+ *)", false);
  });
  assert.test(":has relative argument (a)", function () {
    var fixture = document.getElementById("the-fixture");
    fixture.innerHTML = '<main id=main><div id=d01><div id=d02 class="x"><div id=d03 class="a"></div><div id=d04></div><div id=d05 class="b"></div></div><div id=d06 class="x"><div id=d07 class="x"><div id=d08 class="a"></div></div></div><div id=d09 class="x"><div id=d10 class="a"><div id=d11 class="b"></div></div></div><div id=d12 class="x"><div id=d13 class="a"><div id=d14><div id=d15 class="b"></div></div></div><div id=d16 class="b"></div></div></div><div id=d17><div id=d18 class="x"></div><div id=d19 class="x"></div><div id=d20 class="a"></div><div id=d21 class="x"></div><div id=d22 class="a"><div id=d23 class="b"></div></div><div id=d24 class="x"></div><div id=d25 class="a"><div id=d26><div id=d27 class="b"></div></div></div><div id=d28 class="x"></div><div id=d29 class="a"></div><div id=d30 class="b"><div id=d31 class="c"></div></div><div id=d32 class="x"></div><div id=d33 class="a"></div><div id=d34 class="b"><div id=d35><div id=d36 class="c"></div></div></div><div id=d37 class="x"></div><div id=d38 class="a"></div><div id=d39 class="b"></div><div id=d40 class="x"></div><div id=d41 class="a"></div><div id=d42></div><div id=d43 class="b"><div id=d44 class="x"><div id=d45 class="c"></div></div></div><div id=d46 class="x"></div><div id=d47 class="a"></div></div><div id="extra-d01"><div id=d48 class="x"><div id=d49 class="x"><div id=d50 class="x d"><div id=d51 class="x d"><div id=d52 class="x"><div id=d53 class="x e"><div id=d54 class="f"></div></div></div></div></div></div></div><div id=d55 class="x"></div><div id=d56 class="x d"></div><div id=d57 class="x d"></div><div id=d58 class="x"></div><div id=d59 class="x e"></div><div id=d60 class="f"></div></div><div id="extra-d02"><div id=d61 class="x"></div><div id=d62 class="x y"></div><div id=d63 class="x y"><div id=d64 class="y g"><div id=d65 class="y"><div id=d66 class="y h"><div id=d67 class="i"></div></div></div></div></div><div id=d68 class="x y"><div id=d69 class="x"></div><div id=d70 class="x"></div><div id=d71 class="x y"><div id=d72 class="y g"><div id=d73 class="y"><div id=d74 class="y h"><div id=d75 class="i"></div></div></div></div></div><div id=d76 class="x"></div><div id=d77 class="j"><div id=d78><div id=d79></div></div></div></div><div id=d80 class="j"></div></div></main>';
    var d02 = document.getElementById("d02");
    var d06 = document.getElementById("d06");
    var d07 = document.getElementById("d07");
    var d09 = document.getElementById("d09");
    var d12 = document.getElementById("d12");
    var d18 = document.getElementById("d18");
    var d19 = document.getElementById("d19");
    var d21 = document.getElementById("d21");
    var d24 = document.getElementById("d24");
    var d28 = document.getElementById("d28");
    var d32 = document.getElementById("d32");
    var d37 = document.getElementById("d37");
    var d40 = document.getElementById("d40");
    var d46 = document.getElementById("d46");
    var d48 = document.getElementById("d48");
    var d49 = document.getElementById("d49");
    var d50 = document.getElementById("d50");
    var d51 = document.getElementById("d51");
    var d52 = document.getElementById("d52");
    var d54 = document.getElementById("d54");
    var d55 = document.getElementById("d55");
    var d56 = document.getElementById("d56");
    var d57 = document.getElementById("d57");
    var d58 = document.getElementById("d58");
    var d60 = document.getElementById("d60");
    var d61 = document.getElementById("d61");
    var d62 = document.getElementById("d62");
    var d63 = document.getElementById("d63");
    var d67 = document.getElementById("d67");
    var d68 = document.getElementById("d68");
    var d69 = document.getElementById("d69");
    var d70 = document.getElementById("d70");
    var d71 = document.getElementById("d71");
    var d75 = document.getElementById("d75");
    var d77 = document.getElementById("d77");
    var d80 = document.getElementById("d80");
    testSelectorAllFromMain(assert, ".x:has(.a)", [d02, d06, d07, d09, d12]);
    testSelectorAllFromMain(assert, ".x:has(.a > .b)", [d09]);
    testSelectorAllFromMain(assert, ".x:has(.a .b)", [d09, d12]);
    testSelectorAllFromMain(assert, ".x:has(.a + .b)", [d12]);
    testSelectorAllFromMain(assert, ".x:has(.a ~ .b)", [d02, d12]);
    testSelectorAllFromMain(assert, ".x:has(> .a)", [d02, d07, d09, d12]);
    testSelectorAllFromMain(assert, ".x:has(> .a > .b)", [d09]);
    testSelectorAllFromMain(assert, ".x:has(> .a .b)", [d09, d12]);
    testSelectorAllFromMain(assert, ".x:has(> .a + .b)", [d12]);
    testSelectorAllFromMain(assert, ".x:has(> .a ~ .b)", [d02, d12]);
    testSelectorAllFromMain(assert, ".x:has(+ .a)", [d19, d21, d24, d28, d32, d37, d40, d46]);
    testSelectorAllFromMain(assert, ".x:has(+ .a > .b)", [d21]);
    testSelectorAllFromMain(assert, ".x:has(+ .a .b)", [d21, d24]);
    testSelectorAllFromMain(assert, ".x:has(+ .a + .b)", [d28, d32, d37]);
    testSelectorAllFromMain(assert, ".x:has(+ .a ~ .b)", [d19, d21, d24, d28, d32, d37, d40]);
    testSelectorAllFromMain(assert, ".x:has(~ .a)", [d18, d19, d21, d24, d28, d32, d37, d40, d46]);
    testSelectorAllFromMain(assert, ".x:has(~ .a > .b)", [d18, d19, d21]);
    testSelectorAllFromMain(assert, ".x:has(~ .a .b)", [d18, d19, d21, d24]);
    testSelectorAllFromMain(assert, ".x:has(~ .a + .b)", [d18, d19, d21, d24, d28, d32, d37]);
    testSelectorAllFromMain(assert, ".x:has(~ .a + .b > .c)", [d18, d19, d21, d24, d28]);
    testSelectorAllFromMain(assert, ".x:has(~ .a + .b .c)", [d18, d19, d21, d24, d28, d32]);
    testSelectorAllFromMain(assert, ".x:has(.d .e)", [d48, d49, d50]);
    testSelectorAllFromMain(assert, ".x:has(.d .e) .f", [d54]);
    testSelectorAllFromMain(assert, ".x:has(> .d)", [d49, d50]);
    testSelectorAllFromMain(assert, ".x:has(> .d) .f", [d54]);
    testSelectorAllFromMain(assert, ".x:has(~ .d ~ .e)", [d48, d55, d56]);
    testSelectorAllFromMain(assert, ".x:has(~ .d ~ .e) ~ .f", [d60]);
    testSelectorAllFromMain(assert, ".x:has(+ .d ~ .e)", [d55, d56]);
    testSelectorAllFromMain(assert, ".x:has(+ .d ~ .e) ~ .f", [d60]);
    testSelectorAllFromMain(assert, ".y:has(> .g .h)", [d63, d71]);
    testSelectorAllFromMain(assert, ".y:has(.g .h)", [d63, d68, d71]);
    testSelectorAllFromMain(assert, ".y:has(> .g .h) .i", [d67, d75]);
    testSelectorAllFromMain(assert, ".y:has(.g .h) .i", [d67, d75]);
    testSelectorAllFromMain(assert, ".d .x:has(.e)", [d51, d52]);
    testSelectorAllFromMain(assert, ".d ~ .x:has(~ .e)", [d57, d58]);
  });
  assert.test(":has relative argument (b)", function () {
    var fixture = document.getElementById("the-fixture");
    fixture.innerHTML = '<main id=main><div id=d01><div id=d02 class="x"><div id=d03 class="a"></div><div id=d04></div><div id=d05 class="b"></div></div><div id=d06 class="x"><div id=d07 class="x"><div id=d08 class="a"></div></div></div><div id=d09 class="x"><div id=d10 class="a"><div id=d11 class="b"></div></div></div><div id=d12 class="x"><div id=d13 class="a"><div id=d14><div id=d15 class="b"></div></div></div><div id=d16 class="b"></div></div></div><div id=d17><div id=d18 class="x"></div><div id=d19 class="x"></div><div id=d20 class="a"></div><div id=d21 class="x"></div><div id=d22 class="a"><div id=d23 class="b"></div></div><div id=d24 class="x"></div><div id=d25 class="a"><div id=d26><div id=d27 class="b"></div></div></div><div id=d28 class="x"></div><div id=d29 class="a"></div><div id=d30 class="b"><div id=d31 class="c"></div></div><div id=d32 class="x"></div><div id=d33 class="a"></div><div id=d34 class="b"><div id=d35><div id=d36 class="c"></div></div></div><div id=d37 class="x"></div><div id=d38 class="a"></div><div id=d39 class="b"></div><div id=d40 class="x"></div><div id=d41 class="a"></div><div id=d42></div><div id=d43 class="b"><div id=d44 class="x"><div id=d45 class="c"></div></div></div><div id=d46 class="x"></div><div id=d47 class="a"></div></div><div id="extra-d01"><div id=d48 class="x"><div id=d49 class="x"><div id=d50 class="x d"><div id=d51 class="x d"><div id=d52 class="x"><div id=d53 class="x e"><div id=d54 class="f"></div></div></div></div></div></div></div><div id=d55 class="x"></div><div id=d56 class="x d"></div><div id=d57 class="x d"></div><div id=d58 class="x"></div><div id=d59 class="x e"></div><div id=d60 class="f"></div></div><div id="extra-d02"><div id=d61 class="x"></div><div id=d62 class="x y"></div><div id=d63 class="x y"><div id=d64 class="y g"><div id=d65 class="y"><div id=d66 class="y h"><div id=d67 class="i"></div></div></div></div></div><div id=d68 class="x y"><div id=d69 class="x"></div><div id=d70 class="x"></div><div id=d71 class="x y"><div id=d72 class="y g"><div id=d73 class="y"><div id=d74 class="y h"><div id=d75 class="i"></div></div></div></div></div><div id=d76 class="x"></div><div id=d77 class="j"><div id=d78><div id=d79></div></div></div></div><div id=d80 class="j"></div></div></main>';
    var d01 = document.getElementById("d01");
    var d02 = document.getElementById("d02");
    var d06 = document.getElementById("d06");
    var d07 = document.getElementById("d07");
    var d09 = document.getElementById("d09");
    var d12 = document.getElementById("d12");
    var d17 = document.getElementById("d17");
    var d18 = document.getElementById("d18");
    var d19 = document.getElementById("d19");
    var d20 = document.getElementById("d20");
    var d21 = document.getElementById("d21");
    var d22 = document.getElementById("d22");
    var d24 = document.getElementById("d24");
    var d25 = document.getElementById("d25");
    var d28 = document.getElementById("d28");
    var d29 = document.getElementById("d29");
    var d30 = document.getElementById("d30");
    var d32 = document.getElementById("d32");
    var d33 = document.getElementById("d33");
    var d34 = document.getElementById("d34");
    var d37 = document.getElementById("d37");
    var d38 = document.getElementById("d38");
    var d39 = document.getElementById("d39");
    var d40 = document.getElementById("d40");
    var d41 = document.getElementById("d41");
    var d42 = document.getElementById("d42");
    var d43 = document.getElementById("d43");
    var d46 = document.getElementById("d46");
    var d48 = document.getElementById("d48");
    var d49 = document.getElementById("d49");
    var d50 = document.getElementById("d50");
    var d51 = document.getElementById("d51");
    var d52 = document.getElementById("d52");
    var d54 = document.getElementById("d54");
    var d55 = document.getElementById("d55");
    var d56 = document.getElementById("d56");
    var d57 = document.getElementById("d57");
    var d58 = document.getElementById("d58");
    var d60 = document.getElementById("d60");
    var d61 = document.getElementById("d61");
    var d62 = document.getElementById("d62");
    var d63 = document.getElementById("d63");
    var d67 = document.getElementById("d67");
    var d68 = document.getElementById("d68");
    var d69 = document.getElementById("d69");
    var d70 = document.getElementById("d70");
    var d71 = document.getElementById("d71");
    var d75 = document.getElementById("d75");
    var d77 = document.getElementById("d77");
    var d80 = document.getElementById("d80");
    var extraD01 = document.getElementById("extra-d01");
    var extraD02 = document.getElementById("extra-d02");
    testSelectorAllFromMain(assert, ":has(.a)", [d01, d02, d06, d07, d09, d12, d17]);
    testSelectorAllFromMain(assert, ":has(.a > .b)", [d01, d09, d17]);
    testSelectorAllFromMain(assert, ":has(.a .b)", [d01, d09, d12, d17]);
    testSelectorAllFromMain(assert, ":has(.a + .b)", [d01, d12, d17]);
    testSelectorAllFromMain(assert, ":has(.a ~ .b)", [d01, d02, d12, d17]);
    testSelectorAllFromMain(assert, ":has(> .a)", [d02, d07, d09, d12, d17]);
    testSelectorAllFromMain(assert, ":has(> .a > .b)", [d09, d17]);
    testSelectorAllFromMain(assert, ":has(> .a .b)", [d09, d12, d17]);
    testSelectorAllFromMain(assert, ":has(> .a + .b)", [d12, d17]);
    testSelectorAllFromMain(assert, ":has(> .a ~ .b)", [d02, d12, d17]);
    testSelectorAllFromScope(assert, document.body, ":has(> .a)", [d02, d07, d09, d12, d17]);
    testSelectorAllFromScope(assert, document.body, ":has(> .a > .b)", [d09, d17]);
    testSelectorAllFromScope(assert, document.body, ":has(> .a .b)", [d09, d12, d17]);
    testSelectorAllFromScope(assert, document.body, ":has(> .a + .b)", [d12, d17]);
    testSelectorAllFromScope(assert, document.body, ":has(> .a ~ .b)", [d02, d12, d17]);
    testSelectorAllFromScope(assert, document.getElementById("d01"), ":has(> .a)", [d02, d07, d09, d12]);
    testSelectorAllFromScope(assert, document.getElementById("d01"), ":has(> .a > .b)", [d09]);
    testSelectorAllFromScope(assert, document.getElementById("d01"), ":has(> .a .b)", [d09, d12]);
    testSelectorAllFromScope(assert, document.getElementById("d01"), ":has(> .a + .b)", [d12]);
    testSelectorAllFromScope(assert, document.getElementById("d01"), ":has(> .a ~ .b)", [d02, d12]);
    testSelectorAllFromScope(assert, document.getElementById("d12"), ":has(> .a)", []);
    testSelectorAllFromScope(assert, document.getElementById("d12"), ":has(> .a > .b)", []);
    testSelectorAllFromScope(assert, document.getElementById("d12"), ":has(> .a .b)", []);
    testSelectorAllFromScope(assert, document.getElementById("d12"), ":has(> .a + .b)", []);
    testSelectorAllFromScope(assert, document.getElementById("d12"), ":has(> .a ~ .b)", []);
    testSelectorAllFromScope(assert, document.getElementById("d17"), ":has(> .a)", []);
    testSelectorAllFromScope(assert, document.getElementById("d17"), ":has(> .a > .b)", []);
    testSelectorAllFromScope(assert, document.getElementById("d17"), ":has(> .a .b)", []);
    testSelectorAllFromScope(assert, document.getElementById("d17"), ":has(> .a + .b)", []);
    testSelectorAllFromScope(assert, document.getElementById("d17"), ":has(> .a ~ .b)", []);
    testSelectorAllFromMain(assert, ":has(+ .a)", [d19, d21, d24, d28, d32, d37, d40, d46]);
    testSelectorAllFromMain(assert, ":has(+ .a > .b)", [d21]);
    testSelectorAllFromMain(assert, ":has(+ .a .b)", [d21, d24]);
    testSelectorAllFromMain(assert, ":has(+ .a + .b)", [d28, d32, d37]);
    testSelectorAllFromMain(assert, ":has(+ .a ~ .b)", [d19, d21, d24, d28, d32, d37, d40]);
    testSelectorAllFromMain(assert, ":has(~ .a)", [d18, d19, d20, d21, d22, d24, d25, d28, d29, d30, d32, d33, d34, d37, d38, d39, d40, d41, d42, d43, d46]);
    testSelectorAllFromMain(assert, ":has(~ .a > .b)", [d18, d19, d20, d21]);
    testSelectorAllFromMain(assert, ":has(~ .a .b)", [d18, d19, d20, d21, d22, d24]);
    testSelectorAllFromMain(assert, ":has(~ .a + .b)", [d18, d19, d20, d21, d22, d24, d25, d28, d29, d30, d32, d33, d34, d37]);
    testSelectorAllFromMain(assert, ":has(~ .a + .b > .c)", [d18, d19, d20, d21, d22, d24, d25, d28]);
    testSelectorAllFromMain(assert, ":has(~ .a + .b .c)", [d18, d19, d20, d21, d22, d24, d25, d28, d29, d30, d32]);
    testSelectorAllFromMain(assert, ":has(.d .e)", [extraD01, d48, d49, d50]);
    testSelectorAllFromMain(assert, ":has(.d .e) .f", [d54, d60]);
    testSelectorAllFromMain(assert, ":has(> .d)", [extraD01, d49, d50]);
    testSelectorAllFromMain(assert, ":has(> .d) .f", [d54, d60]);
    testSelectorAllFromMain(assert, ":has(~ .d ~ .e)", [d48, d55, d56]);
    testSelectorAllFromMain(assert, ":has(~ .d ~ .e) ~ .f", [d60]);
    testSelectorAllFromMain(assert, ":has(+ .d ~ .e)", [d55, d56]);
    testSelectorAllFromMain(assert, ":has(+ .d ~ .e) ~ .f", [d60]);
    testSelectorAllFromMain(assert, ":has(> .g .h)", [d63, d71]);
    testSelectorAllFromMain(assert, ":has(.g .h)", [extraD02, d63, d68, d71]);
    testSelectorAllFromMain(assert, ":has(> .g .h) .i", [d67, d75]);
    testSelectorAllFromMain(assert, ":has(.g .h) .i", [d67, d75]);
    testSelectorAllFromMain(assert, ".d :has(.e)", [d51, d52]);
    testSelectorAllFromMain(assert, ".d ~ :has(~ .e)", [d57, d58]);
  });
  cb(true);
})(callback);
})();

/******/ })()
;