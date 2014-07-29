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
  this._queue = this._queue || new TrampolineQueue(this);
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

    this._queue.push(_.bind(function () {
      this._deferreds = {};

      _.each(this._stores, function (_, key) {
        this._deferreds[key] =  Q.defer();
      }, this);

      this._emitter.emit('dispatch', payload);

    }, this));
  }

});

module.exports = {
  Dispatcher: Dispatcher
};


