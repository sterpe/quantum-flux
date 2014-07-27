/*
 * 
 * flux-dispatcher.js */

var _ = require('lodash'),
  EventEmitter = require('./flux-events.js').EventEmitter,
  TrampolineQueue = require('./flux-trampoline.js').TrampolineQueue,
  uuid = require('node-uuid'),
  Q = require('q');

function Dispatcher() {
  "use strict";

  this._queue = this._queue || new TrampolineQueue();
  this._emitter = this._emitter || new EventEmitter();
  this._stores = this._stores || {};
  this.Store = this.Store || (function (dispatcher) {

    function Store() {
      this._guid = this._guid || (function () {
        var guid = uuid.v1();
        console.log('**CREATED NEW STORE** ::', guid);
        return guid;
      }());
    }

    _.extend(Store.prototype, EventEmitter.prototype, {

      register: function (listener) {

        Store.prototype.constructor.call(this);

        if (dispatcher._stores[this._guid] !== undefined) {
          this.unregister(dispatcher._stores[this._guid]);
        }

        dispatcher._stores[this._guid] = _.bind(function (action) {
          try {
            listener.call(this, action);
            dispatcher._deferreds[this._guid].resolve(action);
          } catch (e) {
            dispatcher._deferreds[this._guid].reject(e);
          }
        }, this);
        dispatcher._emitter.addListener('dispatch',
          dispatcher._stores[this._guid]);
      },

      unregister: function (listener) {

        Store.prototype.constructor.call(this);

        dispatcher._emitter.removeListener('dispatch',
          dispatcher._stores[this._guid]);

        delete dispatcher._stores[this._guid];
      },

      waitFor: function (targets, onFulfilled, onRejected) {
        return null;
      }
    });

    return Store;

  }(this));

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


