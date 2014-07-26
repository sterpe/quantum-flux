/*
 * 
 * flux-store.js */

var _ = require('lodash'),
  EventEmitter = require('./flux-events.js').EventEmitter;

function Store(config) {
  "use strict";

  _.extend(this, config);
}

_.extend(Store.prototype, EventEmitter.prototype, {
});

module.exports = {
  Store: Store
};

