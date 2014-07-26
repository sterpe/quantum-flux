/*
 * 
 * flux.js */

module.exports = {
  Dispatcher: require('./lib/flux-dispatcher.js').Dispatcher,
  EventEmitter: require('./lib/flux-events.js').EventEmitter,
  Store: require('./lib/flux-store.js').Store
};

