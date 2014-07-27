/*
 * 
 * flux-store.js */

var _ = require('lodash'),
  EventEmitter = require('./flux-events.js').EventEmitter,
  AppDispatcher = require('./applicationDispatcher.js'),
  guid = require('./flux-guid.js');


//var fooStore = new Store({});
//
//fooStore.register(function () {});
//
//var appDispatcher = Dispatcher.getInstance();
//
function Store(config) {
  "use strict";

  this._guid = this._guid || guid.next();
}

_.extend(Store.prototype, EventEmitter.prototype, {

  getDispatchIndex: function () {
    "use strict";
    return this._dispatchNo;
  },

  register: function (listener, thisArg) {
    "use strict";

    Store.prototype.constructor.call(this);

    this._listener = _.bind(listener, thisArg || this);
    AppDispatcher.register(this._guid, this._listener);

    return this;

  },

  unregister: function (listener) {
    "use strict";

    AppDispatcher.unregister(this, this._listener);
    delete this._dispatchNo;
    delete this._listener;
    return this;
  }
});

module.exports = {
  Store: Store
};

