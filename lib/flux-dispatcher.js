/*
 * 
 * flux-dispatcher.js */

var _ = require('lodash'),
  EventEmitter = require('./flux-events.js').EventEmitter,
  TrampolineQueue = require('./flux-trampoline.js').TrampolineQueue,
  StoreFactory = require('./flux-store.js').StoreFactory,
  Q = require('q');

function Dispatcher() {
  "use strict";

  this._queue = this._queue || new TrampolineQueue();
  this._emitter = this._emitter || new EventEmitter();
  this.Store = this.Store || new StoreFactory(this);
  this._stores = this._stores || {};

}

_.extend(Dispatcher.prototype, {

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
  dispatchImmediate: function (action) {
    "use strict";

    Dispatcher.prototype.constructor.call(this);

    this._queue.push(_.bind(function () {
      this._payload = action;
      this._deferreds = {};

      _.each(this._stores, function (_, key) {
        this._deferreds[key] = Q.defer();
      }, this);

      this._emitter.emit('dispatch', action);

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
  dispatch: function (action) {
    "use strict";

    setTimeout(_.bind(this.dispatchImmediate, this, action), 0);
  }

});

module.exports = {
  Dispatcher: Dispatcher
};


