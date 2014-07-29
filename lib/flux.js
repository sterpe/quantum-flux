/*
 * 
 * flux.js */
var _ = require('lodash'),
  Dispatcher = require('./flux-dispatcher.js').Dispatcher;

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
      dispatchForceNextTick: _.bind(flux.dispatchForceNextTick, flux),
      Store: StoreFactory

    };
  }
};
