/*
 * 
 * max.js */




var maxBy = require('../index.js');
var test = require('tape');

test('simple comparison', function (t) {
  "use strict";
  t.plan(1);
  var n = maxBy([9, 3, 4], function (x) { return x % 3; });
  t.equal(n, 4);
});

