/**
 *
 * @module lib/store.js
 */

var _ = require('lodash'),
  uuid = require('node-uuid'),
  Q = require('q'),
  EventEmitter = require('./events.js').EventEmitter;

/**
 * 
 * StoreFactory is used to create a Store class  that is integrated with
 * with an instance of Dispatcher.
 *
 * This allows for a cleaner API when stores need to register/unregister
 * themselves or request a `waitFor`.
 *
 * @param {Dispatcher}
 * @return {Store}
 */
function StoreFactory(dispatcher) {
  "use strict";

  /**
   * @class
   * @extends EventEmitter
   * @alias Flux.Store
   * @global
   */
  function Store() {

    this._waiting = (this._waiting === undefined) ? false :
        this._waiting;

    this._emitQueue = this._emitQueue || (function (self) {

      self._onEmitSynch = function () {
        while (self._emitQueue.length) {
          self._emitQueue.pop().call();
        }
      };

      return [];
    }(this));

    this._waitingFor = this._waitingFor || [];

    this._guid = this._guid || (function () {
      //Whatever, overkill probably, but at least it's unique.
      var guid = uuid.v1();
      if (console && _.isFunction(console.log)) {
        console.log('**CREATED NEW STORE** ::', guid);
      }
      return guid;

    }());
  }

  _.extend(Store.prototype, EventEmitter.prototype, {

    /**
     * Overwrite EventEmitter.prototype so that our `emit` method
     * is integrated into the Dispatcher instances dispatch-phase.
     *
     * I.e., we don't want to emit anything until after the
     * dispatch-phase is complete & all stores have processed the current
     * payload.  Because all emits are synchronous, we don't have to 
     * worry about our async dispatcher 
     * @function Store#emit
     */
    emit: function () {
      var _emit = EventEmitter.prototype.emit,
        args = Array.prototype.slice.call(arguments);

      this._emitQueue.push(_.bind(function () {
        _emit.apply(this, args);
      }, this));

    },

    /**
     * @function Store#register 
     * @param {function} listener
     */
    register: function (listener) {

      Store.prototype.constructor.call(this);

      if (dispatcher._stores[this._guid] !== undefined) {
        this.unregister(dispatcher._stores[this._guid]);
      }

      dispatcher._stores[this._guid] = _.bind(function (payload) {
        try {
          listener.call(this, payload);
          if (!this._waiting) {
            dispatcher._deferreds[this._guid].resolve(payload);
          }
        } catch (e) {
          dispatcher._deferreds[this._guid].reject(e);
          throw e;
        }
      }, this);
      dispatcher._emitter.addListener('dispatch',
        dispatcher._stores[this._guid]);
      dispatcher._emitter.addListener('emit',
        this._onEmitSynch);

    },

    /**
     * @function Store#unregister
     * @param {function} listener
     */
    unregister: function (listener) {

      Store.prototype.constructor.call(this);

      dispatcher._emitter.removeListener('dispatch',
        dispatcher._stores[this._guid]);

      dispatcher._emitter.removeListener('emit',
        this._onEmitSynch);

      this._waiting = false;
      this._waitingFor = [];

      delete dispatcher._stores[this._guid];
    },

    /**
     * @function Store#waitFor
     * @param {array} targets
     * @param {function} onFulfilled,
     * @param {funciton} onRejected
     * @return {promise}
     */
    waitFor: function (targets, onFulfilled, onRejected) {
      var self = this,
        cyclic;

      if (!_.isArray(targets)) {
        targets = [targets];
      }

      cyclic = _.find(targets, function (store) {
        return store === this || store._waitingFor.indexOf(this) !== -1;
      }, this);

      if (cyclic !== undefined) {
        throw new Error('Cyclic dependency between Stores:\n' +
          this._guid + ' & ' + cyclic._guid);
      }

      this._waiting = true;
      this._waitingFor = targets;
      dispatcher._queue.defer();

      targets = _.map(targets, function (store) {
        return store._guid;
      });

      Q.all(_.filter(_.map(dispatcher._deferreds,
        function (deferred, guid) {
          return targets.indexOf(guid) !== -1 ?
              deferred.promise : false;
        }), _.identity))

        .then(function (x) {
          //Q.all always returns array of promise values,
          //In this case the value is always the same (the payload).
          //Therefore we can just `pop` off any old one.
          //
          //Also don't assume that onFulfilled/onRejected will pass the
          //value the way we like back into the promise chain...
          var payload = x.pop();
          onFulfilled.call(self, payload);
          return payload;
        }, function (e) {
          onRejected.call(self, e);
          throw e;
        })

        .then(function (payload) {
          dispatcher._deferreds[self._guid].resolve(payload);
        }, function (e) {
          dispatcher._deferreds[self._guid].reject(e);
        })

        .finally(function () {
          self._waiting = false;
          self._waitingFor = [];
          //This store is now completely done with this dispatch phase/payload.
        });

      return; /* Keep the promise internal so that it can't be used to
        to create an undetectable? cyclic dependency else where.*/
    }
  });

  return (function (prototype) {

    function Store(options) {
      _.extend(this, options);
    }

    _.extend(Store.prototype, prototype);

    return Store;

  }(Store.prototype));
}

module.exports = {
  StoreFactory: StoreFactory
};

