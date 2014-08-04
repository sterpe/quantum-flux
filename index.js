/*
 * 
 * index.js */

module.exports = function (xs, f) {
  "use strict";
  return xs.reduce(function (max, x) {
    return f(x) > f(max) ? x : max;
  });
};

