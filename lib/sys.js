/*
 * 
 * @module lib/sys.js
 */

var _ = require('lodash');

/**
 *
 * Generate a fast, platform specific  `nextTick(fn)`
 * If window.postMessage is available we use that, else we use
 * the slower, clamped window.setTimeout.
 * In node environments use the actual process.nextTick().
 *
 * @class
 * @internal
 */
function SystemNextTick() {
  "use strict";

  var r = (Math.random() * 1E17).toString(36);

  if ("undefined" !== typeof window) {
    if (window.postMessage &&
        _.isFunction(window.postMessage)) {

      return function (fn) {
        var currentToken = r + "@flux-sys:" +
          (Math.random() * 1E17).toString(10);

        function onmessage(e) {
          if (!e || e.source !== window ||
              e.data !== currentToken) {
            return;
          }
          window.removeEventListener('message', onmessage, false);
          fn.call(undefined);
        }

        window.addEventListener('message', onmessage, false);
        window.postMessage(currentToken, "*");
      };
    }

    return function (fn) {
      setTimeout(fn, 0);
    };
  }

  return function (fn) {
    process.nextTick(fn);
  };
}

module.exports = {
  SystemNextTick: SystemNextTick
};
