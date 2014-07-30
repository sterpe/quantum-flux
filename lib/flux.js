/*
 * 
 * @module lib/flux.js
 */

var _ = require('lodash'),
  Dispatcher = require('./dispatcher.js').Dispatcher;

/**
 * @class
 * @extends Dispatcher
 */

function Flux() {
  "use strict";
  Dispatcher.prototype.constructor.call(this);
}

_.extend(Flux.prototype, Dispatcher.prototype);

module.exports = {

  Flux: function () {
    "use strict";
    var flux = new Flux(),
      StoreFactory = _.bind(flux.Store, flux);

    StoreFactory.prototype = flux.Store.prototype;

    return {
      dispatch: _.bind(flux.dispatch, flux),
      Store: StoreFactory
    };
  }
};
