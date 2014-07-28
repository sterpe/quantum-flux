/*
 * 
 * storeFactory.js */

var _ = require('lodash'),
  uuid = require('node-uuid'),
  Q = require('q'),
  EventEmitter = require('./flux-events.js');

function StoreFactory(dispatcher) {
  "use strict";

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

    unregister: function (listener) {

      Store.prototype.constructor.call(this);

      dispatcher._emitter.removeListener('dispatch',
        dispatcher._stores[this._guid]);

      this._waiting = false;
      this._waitingFor = [];

      delete dispatcher._stores[this._guid];
    },

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
        throw new Error('Cyclic Dependency!');
      }

      this._waiting = true;
      this._waitingFor = targets;

      targets = _.map(targets, function (store) {
        return store._guid;
      });

      return Q.all(_.filter(_.map(dispatcher._deferreds,
        function (deferred, guid) {
          return targets.indexOf(guid) !== -1 ? deferred.promise : null;
        }), _.identity))

        .then(onFulfilled, onRejected)

        .then(function () {
          dispatcher._deferreds[self._guid].resolve(dispatcher._payload);
        }, function (e) {
          dispatcher._deferreds[self._guid].reject(e);
        })

        .finally(function () {
          self._waiting = false;
          self._waitingFor = [];
        });
    }
  });

  return Store;
}

module.exports = {
  StoreFactory: StoreFactory
};

