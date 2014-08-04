
var _ = require('lodash'),
  sys = require('./sys.js'),
  EventEmitter = require('./events.js').EventEmitter,
  PROCESS_STATUS = require('./constants.json').PROCESS_STATUS;


function _process() {
  "use strict";

  var self = this.__taskProcessQueue,
    task;

  if (self.status === PROCESS_STATUS.WAIT) {
    self.status = PROCESS_STATUS.BUSY;
    this.emit('processAwake');
  }

  this.emit('processStart');
  while (self.work_q.length) {
    self.stage_q.push(self.work_q.pop());
  }
  while (self.stage_q.length) {


    while (self.stage_q.length) {
      self.work_q.push(self.stage_q.pop());
    }
    this.emit('taskStart');
    while (self.stage_q.length) {
      self.work_q.push(self.stage_q.pop());
    }

    task = self.work_q.pop();
    task.call();
    this.emit('taskEnd');

    if (self.status === PROCESS_STATUS.HALT) {
      this.emit('processHalt');
      self.status = PROCESS_STATUS.WAIT;
      this.emit('processSleep');
      return sys.nextTick(self.process);
    }

    while (self.work_q.length) {
      self.stage_q.push(self.work_q.pop());
    }

  }

  self.status = PROCESS_STATUS.IDLE;
  this.emit('processEnd');
}


function TaskProcessQueue() {
  "use strict";

  this.__taskProcessQueue = this.__taskProcessQueue || {
    stage_q: [],
    work_q: [],
    status: PROCESS_STATUS.IDLE,
    process: _.bind(_process, this)
  };

}

_.extend(TaskProcessQueue.prototype, EventEmitter.prototype);

_.extend(TaskProcessQueue.prototype, {

  enqueue: function (task) {
    "use strict";

    var self;

    TaskProcessQueue.prototype.constructor.call(this);

    self = this.__taskProcessQueue;

    console.log('enquing next taks');
    if (self.status === PROCESS_STATUS.IDLE) {
      self.status = PROCESS_STATUS.BUSY;
      sys.nextTick(self.process);
      console.log('async');
    }
    self.stage_q.push(task);
    console.log(self.stage_q.length);

  },

  halt: function () {
    "use strict";

    var self;

    TaskProcessQueue.prototype.constructor.call(this);

    self = this.__taskProcessQueue;

    if (self.status === PROCESS_STATUS.BUSY) {
      self.status = PROCESS_STATUS.HALT;
    }
  }
});

module.exports = TaskProcessQueue;

/*var _ = require('lodash'),
  SystemNextTick = require('./sys.js').SystemNextTick,
  STATUS = {
    IDLE: 0,
    RUN: 1
  };
function Queue(dispatcher) {
  "use strict";

  this._halt = this._halt || false;
  this._status = this._status ||  STATUS.IDLE;
  this._queue = this._queue || [];
  this._work_queue = this._work_queue || [];
  this._nextTick = this._nextTick || new SystemNextTick();
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
      dispatcher.emit('emit');
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
    dispatcher.emit('emit');
  }, this);

}

_.extend(Queue.prototype, {

  halt: function () {
    "use strict";
    this._halt = true;
  },

  enqueue: function (task) {
    "use strict";

    Queue.prototype.constructor.call(this);

    if (this._status === STATUS.IDLE) {
      this._status = STATUS.RUN;
      this._nextTick(this._process);
    }
    return this._queue.push(task);
  }

});

module.exports = {
  Queue: Queue
};
*/
