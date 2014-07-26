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
  /**
   * Register a Store's listener so that it may be invoked by an action.
   * @param {function} listener  The listener to be registered.
   * @return {number}  The index of the listener in `this._emitter._events`.
   */
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
  /**
   * TODO: Unregister a Store.
   *
   */
  /*
  unregister: function (listener) {
    "use strict";
    if (this._emitter) {
      this._emitter.removeListener('dispatch', listener);
    }
    return this;
  },
  */
  /**
   * Dispatch something immediately, if a dispatch is in progress this 
   * implies before the environment equivalent of `process.nextTick`, if
   * no current dispatch operation is in progress it means at
   * `process.nextTick`.
   *
   * Note this does not represent a change of order or guarantee of
   * immediate invocation --- only the guarantee that if during a dispatch 
   * dispatch(A) and dispatchImmediate(B) are both called in any order,
   * B will proceed A.
   *
   * See examples/flux-sample.js...
   *
   * @param {object} dispatch  The argument to be dispatched.
   */
  dispatchImmediate: function (dispatch) {
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

  /**
   * Dispatch something at environment equivalent of `process.nextTick`
   * Calls to dispatch that occur during the current dispatch phase will
   * be queued up and processed after the current phase completes.
   *
   * Compare to `dispatchImmediate`...
   *
   * @param {object} dispatch  The argument to be dispatched. 
   */
  dispatch: function (dispatch) {
    "use strict";

    setTimeout(_.bind(this.dispatchImmediate, this, dispatch), 0);
  },

  /**
   * Allow a store to wait for other stores to complete the current dispatch
   * phase.
   *
   * TODO: Detect circular dependencies.
   * @param {number||array} storeIndex  The index of the stores to wait on.
   * @param {function} callback  The callback to be executed once other
   *    stores have completed.
   * @param {function} errback  The errback to be executed if there was
   *    an error resolving the promise
   * @return {promise}  A promise-aplus compliant promise.
   */
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


