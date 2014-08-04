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

var _ = require('lodash'),
  uuid = require('node-uuid');

function NextTick() {
  "use strict";

  var instanceToken = uuid.v1() + '@sys-next-tick:',
    onMessage;

  if ("undefined" !== typeof window) {

    if (window.postMessage &&
        _.isFunction(window.postMessage)) {

      onMessage = function (e) {
        if (!e || e.source !== this.window ||
            e.origin !== this.origin ||
              e.data !== this.currentToken) {
          return;
        }
        window.removeEventListener('message', this.listener, false);
        this.fn.call();
      };

      return function (fn) {

        var self = {
            window: window,
            origin: window.location.origin,
            currentToken: instanceToken +
              (Math.random() * 1e17).toString(10),
            fn: fn
          };

        self.listener = _.bind(onMessage, self);
        window.addEventListener('message', self.listener, false);
        window.postMessage(self.currentToken, window.location);
      };
    }

    return _.partialRight(setTimeout, 0);
  }

  return _.partial(process.nextTick);
}

module.exports = {
  nextTick: new NextTick(),
  NextTickFactory: NextTick
};
