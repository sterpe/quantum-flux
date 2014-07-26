/*
 * 
 * flux-dispatcher.js */

var _ = require('lodash'),
  EventEmitter = require('./flux-events.js').EventEmitter,
  TrampolineQueue = require('./flux-trampoline.js').TrampolineQueue,
  Q = require('q');

function Dispatcher() {
  "use strict";

  this._queue = this._queue || new TrampolineQueue();
  this._emitter = this._emitter || new EventEmitter();
}

_.extend(Dispatcher.prototype, {

  register: function (listener) {
    "use strict";
    var i;

    Dispatcher.prototype.constructor.call(this);

    i = EventEmitter.listenerCount(this._emitter, 'dispatch');

    this._emitter.addListener('dispatch', _.bind(function (i, e) {
      try {
        listener.call(undefined, e);
        this._deferreds[i].resolve(e);
      } catch (r) {
        this._deferreds[i].reject(r);
      }
    }, this, i));

    if (EventEmitter.listenerCount(this._emitter, 'dispatch') !== (i + 1)) {
      throw new Error();
    }
    return i;
  },

  /*
  unregister: function (listener) {
    "use strict";
    if (this._emitter) {
      this._emitter.removeListener('dispatch', listener);
    }
    return this;
  },
  */

  dispatch: function (dispatch) {
    "use strict";

    Dispatcher.prototype.constructor.call(this);

    this._queue.push(_.bind(function () {
      this._deferreds = _.map(this._emitter.listeners('dispatch'),
        function (_, i) {
          return Q.defer();
        });
      this._emitter.emit('dispatch', dispatch);
    }, this));
  },

  waitFor: function (storeIndex, callback, errback) {
    "use strict";

    if (_.isArray(storeIndex)) {
      return Q.all(_.filter(this._deferreds, function (_, i) {
        return storeIndex.indexOf(i) !== -1;
      }));
    }
    return this._deferreds[storeIndex].promise.then(callback, errback);
  }

});

module.exports = {
  Dispatcher: Dispatcher
};


