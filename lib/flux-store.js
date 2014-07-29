var _ = require('lodash'),
  uuid = require('node-uuid'),
  Q = require('q'),
  EventEmitter = require('./flux-events.js').EventEmitter;

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

    this._waitingFor = this._waitingFor || [];

    this._guid = this._guid || (function () {

      var guid = uuid.v1();
      console.log('**CREATED NEW STORE** ::', guid);
      return guid;

    }());
  }

  _.extend(Store.prototype, EventEmitter.prototype, {
    /**
     * @function Store#register 
     * @param {function} listener
     */
    register: function (listener) {

      Store.prototype.constructor.call(this);

      if (dispatcher._stores[this._guid] !== undefined) {
        this.unregister(dispatcher._stores[this._guid]);
      }

      dispatcher._stores[this._guid] = _.bind(function (action) {
        try {
          listener.call(this, action);
          if (!this._waiting) {
            dispatcher._deferreds[this._guid].resolve(action);
          }
        } catch (e) {
          dispatcher._deferreds[this._guid].reject(e);
          throw e;
        }
      }, this);
      dispatcher._emitter.addListener('dispatch',
        dispatcher._stores[this._guid]);
    },
    /**
     * @function Store#unregister
     * @param {function} listener
     */
    unregister: function (listener) {

      Store.prototype.constructor.call(this);

      dispatcher._emitter.removeListener('dispatch',
        dispatcher._stores[this._guid]);

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
        payload = dispatcher._deferreds[this._guid].payload,
        cyclic;

      if (!_.isArray(targets)) {
        targets = [targets];
      }

      cyclic = _.find(targets, function (store) {
        return store === this || store._waitingFor.indexOf(this) !== -1;
      }, this);

      if (cyclic !== undefined) {
        throw new Error('Cyclic Dependency!');
      }

      this._waiting = true;
      this._waitingFor = targets;

      targets = _.map(targets, function (store) {
        return store._guid;
      });

      return Q.all(_.filter(_.map(dispatcher._deferreds,
        function (deferred, guid) {
          return targets.indexOf(guid) !== -1 ?
              deferred.promise : null;
        }), _.identity))

        .then(function (x) {
          onFulfilled.call(self, payload);
        }, onRejected)

        .then(function () {
          dispatcher._deferreds[self._guid]
            .resolve();
        }, function (e) {
          dispatcher._deferreds[self._guid].reject(e);
        })

        .finally(function () {
          self._waiting = false;
          self._waitingFor = [];
        });
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

