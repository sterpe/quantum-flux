/*
 * 
 * flux-trampoline.js */
var _ = require('lodash'),
  NextTick = require('./flux-nextTick.js').NextTick,
  STATUS = {
    IDLE: 0,
    RUN: 1
  };
function TrampolineQueue() {
  "use strict";

  this._status = this._status ||  STATUS.IDLE;
  this._queue = this._queue || [];
  this._nextTick = this._nextTick || new NextTick();
  this._process = this._process || _.bind(function () {
    var work_queue = [];

    //while (this._queue.length) {
      //while (this._queue.length) {
        //work_queue.push(this._queue.pop());
      //}
      //while (work_queue.length) {
        //work_queue.pop().call();
      //}
   // }
    //while (this._queue.length) {
     // work_queue.push(this._queue.pop());
    //}
    while (this._queue.length) {
      work_queue.push(this._queue.pop());
    }
    if (work_queue.length) {
      work_queue.pop().call();
    }
    while (work_queue.length) {
      this._queue.push(work_queue.pop());
    }
    if (this._queue.length) {
      this._nextTick(this._process);
    } else {
      this._status = STATUS.IDLE;
      console.log('work_queue was drained.');
    }
  }, this);

  /*this._queue = this._queue || (_.bind(function () {
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

    this._key = "flux-trampoline:" + this._keygen();

    return [];

  }, this)());
  */

}

_.extend(TrampolineQueue.prototype, {

  push: function (task) {
    "use strict";

    TrampolineQueue.prototype.constructor.call(this);

    if (this._status === STATUS.IDLE) {
      this._status = STATUS.RUN;
      this._nextTick(this._process);
    }
    return this._queue.push(task);

  }

  /*
  _keygen: function () {
    "use strict";

    return (Math.random() * 1E17)
      .toString(10);
  },

  _onmessage: function (e) {
    "use strict";

    if (!e || e.source !== window ||
        e.data !== this._key) {
      return;
    }
    this._process();
    window.removeEventListener('message', this._onmessage, false);
    this._key = "flux-trampoline:" + this._keygen();
  },
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
  */
});

module.exports = {
  TrampolineQueue: TrampolineQueue
};
