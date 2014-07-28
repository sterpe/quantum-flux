/*
 * 
 * flux-trampoline.js */
var _ = require('lodash'),
  STATUS = {
    IDLE: 0,
    RUN: 1
  };
/**
 * @class
 */
function TrampolineQueue() {
  "use strict";
  this._status = STATUS.IDLE;
  this._queue = this._queue || (_.bind(function () {
    this._onmessage = _.bind(this._onmessage, this);
    this._nextTick = (function (self) {

      var proc = _.bind(self._process, self);

      if (typeof window !== "undefined") {
        if (window.postMessage &&
            _.isFunction(window.postMessage)) {
          return function () {
            window.addEventListener('message', this._onmessage, false);
            window.postMessage(this._key, "*");
          };
        }
        return function () {
          setTimeout(proc, 0);
        };
      }
      return function () {
        process.nextTick(proc);
      };
    }(this));

    this._key = "flux-dispatch:" + this._keygen();

    return [];

  }, this)());

}

_.extend(TrampolineQueue.prototype, {
  /**
   * @function TrampolineQueue#push
   * @param {function} task
   */
  push: function (task) {
    "use strict";

    TrampolineQueue.prototype.constructor.call(this);

    if (this._status === STATUS.IDLE) {
      this._status = STATUS.RUN;
      this._nextTick();
    }
    return this._queue.push(task);
  },

  /**
   * @function TrampolineQueue#_keygen
   * @return {string} a random key.
   */ 
  _keygen: function () {
    "use strict";

    return (Math.random() * 1E17)
      .toString(Math.floor(Math.random() * 35) + 2);
  },
  /**
   * @function TrampolineQueue#_onmessage
   * @param {messageEvent} e
   */ 
  _onmessage: function (e) {
    "use strict";

    if (!e || e.source !== window ||
        e.data !== this._key) {
      return;
    }
    this._process();
    window.removeEventListener('message', this._onmessage, false);
    this._key = "flux-dispatch:" + this._keygen();
  },
  /**
   * Process the internal queue (after a push) until it is drained.
   * @function TrampolineQueue#_process
   */
  _process: function () {
    "use strict";

    var work_queue = [];

    while (this._queue.length) {
      while (this._queue.length) {
        work_queue.push(this._queue.pop());
      }
      while (work_queue.length) {
        work_queue.pop().call();
      }
    }

    this._status = STATUS.IDLE;
  }
});

module.exports = {
  TrampolineQueue: TrampolineQueue
};
