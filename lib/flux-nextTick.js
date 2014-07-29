/*
 * 
 * flux-trampoline.js */
var _ = require('lodash');

function NextTick() {
  "use strict";
  var r = (Math.random() * 1E17).toString(36);

  if (typeof window !== "undefined") {
    if (window.postMessage &&
        _.isFunction(window.postMessage)) {

      return function (fn) {
        var currentToken = r + "@flux-nextTick:" +
          (Math.random() * 1E17).toString(10);

        function onmessage(e) {
          if (!e || e.source !== window ||
              e.data !== currentToken) {
            return;
          }
          fn.call(undefined);
          window.removeEventListener('message', onmessage, false);
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
  NextTick: NextTick
};
