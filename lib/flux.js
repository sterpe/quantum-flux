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

  return {
    dispatch: _.bind(this.dispatch, this),
    register: _.bind(this.register, this),
    unregister: _.bind(this.unregister, this),
    setImmediate: _.bind(this.setImmediate, this),
    interlace: _.bind(this.interlace, this),
    deInterlace: _.bind(this.deinterlace, this)
  }
}

_.extend(Flux.prototype, Dispatcher.prototype);

module.exports = Flux;
/*
module.exports = {

  FluxInstance: function () {
    "use strict";
    var flux = new Flux();
      //StoreFactory = _.bind(flux.Store, flux);

    //StoreFactory.prototype = flux.Store.prototype;

    return {
      dispatch: _.bind(flux.dispatch, flux),
      //Store: StoreFactory
      Dispatcher: Dispatcher
    };
  }
};

*/

window.Quantum = module.exports;
