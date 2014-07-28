/*
 * 
 * flux-dispatcher.js */

var _ = require('lodash'),
  EventEmitter = require('./flux-events.js').EventEmitter,
  TrampolineQueue = require('./flux-trampoline.js').TrampolineQueue,
  StoreFactory = require('./flux-store.js').StoreFactory,
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
  this._stores = this._stores || {};

}

_.extend(Dispatcher.prototype, {

  /**
   * @function Dispatcher#dispatch
   * @param {object} action  Argument to be dispatched.
   */
  dispatch: function (action) {
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
   * @function Dispatcher#dispatchNextTick 
   * @param {object} action  Argument to be dispatched. 
   */
  dispatchNextTick: function (action) {
    "use strict";

    setTimeout(_.bind(this.dispatch, this, action), 0);
  }

});
/**
 * @module lib/flux-dispatcher
 */
module.exports = {
  Dispatcher: Dispatcher
};


