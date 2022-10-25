(function (cb) {
  var assert = {
    test: function test(message, callback) {
      // console.log('\n' + message);
      callback();
    },
    step: function step(message) {
      // console.log('  ' + message);
    },
    equal: function equal(a, b) {
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
          // console.log(a, ' - ', b);
          throw new Error('Arrays are not equal');
        }
        for (var i = 0; i < a.length; i++) {
          assert.equal(a[i], b[i]);
        }
        return;
      }
      if (a !== b) {
        // console.log(a, ' - ', b);
        throw new Error('Expected A to equal to B');
      }
    },
    ok: function ok(a) {
      if (!!a) {
        return;
      }

      // console.log(a);
      throw new Error('Expected something truthy for A');
    }
  };
  function formatElements(elements) {
    var ids = [];
    for (var i = 0; i < elements.length; i++) {
      ids.push(elements[i].id);
    }
    return ids.sort().join(',');
  }

  // Test that |selector| returns the given elements in #main.
  function testSelectorAllFromMain(assert, selector, expected) {
    assert.step(selector + ' matches expected elements from #main');
    var actual = Array.from(document.getElementById("main").querySelectorAll(selector));
    assert.equal(formatElements(actual), formatElements(expected));
  }

  // Test that |selector| returns the given elements in the given scope element
  function testSelectorAllFromScope(assert, scope, selector, expected) {
    assert.step(selector + ' matches expected elements from scope ' + scope.id || scope.tagName);
    var actual = Array.from(scope.querySelectorAll(selector));
    assert.equal(formatElements(actual), formatElements(expected));
  }

  // Test that |selector| returns the given element in #main.
  function testSelector(assert, selector, expected) {
    assert.step(selector + ' matches expected element');
    assert.equal(document.getElementById("main").querySelector(selector).id, expected.id);
  }

  // Test that |selector| returns the given closest element.
  function testClosest(assert, node, selector, expected) {
    assert.step('closest(' + selector + ') returns expected element');
    assert.equal(node.closest(selector), expected);
  }

  // Test that |selector| returns matching status.
  function testMatches(assert, node, selector, expected) {
    assert.step(selector + ' matches expectedly');
    assert.equal(node.matches(selector), expected);
  }

  // Test that |selector1| and |selector2| returns same elements in the given scope element
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
  } catch (_) {/* noop */}
  assert.test("is valid selector", function () {
    assert.ok(document.body.querySelector(":has(*)"));
  });
  assert.test("accepts broken selector lists", function () {
    assert.ok(document.body.querySelector(":has(*, :does-not-exist)"));
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
    // see : https://github.com/w3c/csswg-drafts/issues/7676
    // testSelectorAllFromMain(assert, ":has(.sibling:has(.descendant) ~ .target)", []);
    // testSelectorAllFromMain(assert, ":has(.sibling:has(.descendant) ~ .target) ~ .parent > .descendant", []);
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

    // descendants of a scope element cannot have the scope element as its descendant
    testSelectorAllFromScope(assert, scope1, ":has(:scope)", []);
    testSelectorAllFromScope(assert, scope1, ":has(:scope .c)", []);
    testSelectorAllFromScope(assert, scope1, ":has(.a :scope)", []);

    // there can be more simple and efficient alternative for a ':scope' in ':has'
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

    // :has as compound selector part.
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
    // see : https://github.com/w3c/csswg-drafts/issues/7676
    // testSelectorAllFromMain(assert, ".x:has(+ .y:has(> .g .h) .i)", []);
    // testSelectorAllFromMain(assert, ".x:has(+ .y:has(.g .h) .i)", []);
    // testSelectorAllFromMain(assert, ".x:has(+ .y:has(> .g .h) .i) ~ .j", []);
    // testSelectorAllFromMain(assert, ".x:has(+ .y:has(.g .h) .i) ~ .j", []);
    // testSelectorAllFromMain(assert, ".x:has(~ .y:has(> .g .h) .i)", []);
    // testSelectorAllFromMain(assert, ".x:has(~ .y:has(.g .h) .i)", []);

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

    // :has as simple selector part.
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
    // see : https://github.com/w3c/csswg-drafts/issues/7676
    // testSelectorAllFromMain(assert, ":has(+ :has(> .g .h) .i)", []);
    // testSelectorAllFromMain(assert, ":has(+ :has(.g .h) .i)", []);
    // testSelectorAllFromMain(assert, ":has(+ :has(> .g .h) .i) ~ .j", []);
    // testSelectorAllFromMain(assert, ":has(+ :has(.g .h) .i) ~ .j", []);
    // testSelectorAllFromMain(assert, ":has(~ :has(> .g .h) .i)", []);
    // testSelectorAllFromMain(assert, ":has(~ :has(.g .h) .i)", []);

    testSelectorAllFromMain(assert, ".d :has(.e)", [d51, d52]);
    testSelectorAllFromMain(assert, ".d ~ :has(~ .e)", [d57, d58]);
  });
  cb(true);
})(callback);
