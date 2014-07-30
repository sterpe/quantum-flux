/**
 *
 * @module lib/dispatcher.js
 */

var _ = require('lodash'),
  EventEmitter = require('./events.js').EventEmitter,
  Queue = require('./trampoline.js').Queue,
  StoreFactory = require('./store.js').StoreFactory,
  SystemNextTick = require('./sys.js').SystemNextTick,
  Q = require('q');

/**
 * Creates a new Dispatcher.
 * @class
 */
function Dispatcher() {
  "use strict";

  /**
   * Creates a new Store.
   * @function Dispatcher#Store
   * @return {Store}
   */
  this.Store = this.Store || new StoreFactory(this);
  this._queue = this._queue || new Queue(this);
  this._emitter = this._emitter || new EventEmitter();
  this._nextTick = this._nextTick || new SystemNextTick();
  this._stores = this._stores || {};

}

_.extend(Dispatcher.prototype, {

  /**
   * The only thing the dispatcher does is dispatch payloads to
   * registered stores.
   *
   * Payloads are queued up and processed on a trampoline queue in a fashion
   * similiar to that used for asynchronous promise resolution by a number
   * of promise libraries.
   *
   * A Store is an exposed sub-class of the Dispatcher instance, 
   * stores handle the logic of their own registration, deregistration,
   * and waitFors with their parent dispatcher.
   *
   * @function Dispatcher#dispatch
   * @param {object} payload  The argument to be dispatched.
   */
  dispatch: function (payload) {
    "use strict";

    //Support prototypal extends...
    Dispatcher.prototype.constructor.call(this);

    //this._queue.enqueue(_.bind(function () {
    this.enqueue(_.bind(function () {
      this._deferreds = {};

      _.each(this._stores, function (_, key) {
        //this._stores is a hashmap of registered store listeners keyed by
        //store guid.
        this._deferreds[key] =  Q.defer();
      }, this);

      //this._emitter.emit('dispatch', payload);
      this.emit('dispatch', payload);

    }, this));
  },

  emit: function () {
    "use strict";

    return this._emitter.emit.apply(this._emitter, arguments);
  },

  enqueue: function () {
    "use strict";

    return this._queue.enqueue.apply(this._queue, arguments);
  }
});

module.exports = {
  Dispatcher: Dispatcher
};


