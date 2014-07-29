/*
 * 
 * flux-dispatcher.js */

var _ = require('lodash'),
  EventEmitter = require('./flux-events.js').EventEmitter,
  TrampolineQueue = require('./flux-trampoline.js').TrampolineQueue,
  StoreFactory = require('./flux-store.js').StoreFactory,
  NextTick = require('./flux-nextTick.js').NextTick,
  Q = require('q');

/**
 * Creates a new Dispatcher.
 * @class
 */
function Dispatcher() {
  "use strict";
  this._queue = this._queue || new TrampolineQueue();
  this._emitter = this._emitter || new EventEmitter();
  /**
   * Creates a new Store.
   * @function Dispatcher#Store
   * @return {Store}
   */
  this.Store = this.Store || new StoreFactory(this);
  this._nextTick = this._nextTick || new NextTick();
  this._stores = this._stores || {};

}

_.extend(Dispatcher.prototype, {

  /**
   * @function Dispatcher#dispatch
   * @param {object} payload  Argument to be dispatched.
   */
  dispatch: function (payload) {
    "use strict";

    Dispatcher.prototype.constructor.call(this);

    this._payload = payload;

    this._queue.push(_.bind(function () {
      this._deferreds = {};

      _.each(this._stores, function (_, key) {
        var deferred = Q.defer();
        deferred.payload = payload;
        this._deferreds[key] =  deferred;
        /*{
          resolve: function () {
            deferred.resolve(payload);
          },
          reject: function (e) {
            deferred.reject(e);
          },
          promise: deferred.promise,
          payload: payload
        };
        */
      }, this);

      this._emitter.emit('dispatch', payload);

    }, this));
  },

  /**
   * @function Dispatcher#dispatchForceNextTick 
   * @param {object} action  Argument to be dispatched. 
   */
  dispatchForceNextTick: function (payload) {
    "use strict";

    this._nextTick(_.bind(this.dispatch, this, payload));
  }

});

module.exports = {
  Dispatcher: Dispatcher
};


