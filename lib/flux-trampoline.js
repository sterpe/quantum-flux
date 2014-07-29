/*
 * 
 * flux-trampoline.js */
var _ = require('lodash'),
  NextTick = require('./flux-nextTick.js').NextTick,
  STATUS = {
    IDLE: 0,
    RUN: 1
  };
function TrampolineQueue(dispatcher) {
  "use strict";

  this._halt = this._halt || false;
  this._status = this._status ||  STATUS.IDLE;
  this._queue = this._queue || [];
  this._work_queue = this._work_queue || [];
  this._nextTick = this._nextTick || new NextTick();
  this._process = this._process || _.bind(function () {
    var target;

    while (this._work_queue.length) {
      this._queue.push(this._work_queue.pop());
    }
    while (this._queue.length) {
      while (this._queue.length) {
        this._work_queue.push(this._queue.pop());
      }
      target = this._work_queue.pop();
      dispatcher._emitter.emit('emit');
      target.call();
      if (this._halt) {
        this._halt = false;
        return this._nextTick(this._process);
      }
      while (this._work_queue.length) {
        this._queue.push(this._work_queue.pop());
      }
    }
    this._status = STATUS.IDLE;
    dispatcher._emitter.emit('emit');
  }, this);

}

_.extend(TrampolineQueue.prototype, {

  defer: function () {
    "use strict";
    this._halt = true;
  },

  push: function (task) {
    "use strict";

    TrampolineQueue.prototype.constructor.call(this);

    if (this._status === STATUS.IDLE) {
      this._status = STATUS.RUN;
      this._nextTick(this._process);
    }
    return this._queue.push(task);

  }

});

module.exports = {
  TrampolineQueue: TrampolineQueue
};
