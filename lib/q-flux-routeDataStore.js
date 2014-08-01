/*
 * 
 * lib/q-flux-routeDataStore.js */

var _ =  require('lodash'),
  flux = require('./q-flux-instance.js');

var routeDataStore = new flux.Store({

  history: [],

  handler: function (payload) {
    "use strict";
    switch (payload.actionType) {
    case 'window.hashchange':
      this.history.push(payload.data.newHash);
      this.emit('change', payload.data.newHash, payload.data.oldHash);
      break;
    default:
      return;
    }
  },

  currentRoute: function () {
    "use strict";

    return this.history[this.history.length - 1];
  }

});

routeDataStore.register(routeDataStore.handler);

module.exports = routeDataStore;

