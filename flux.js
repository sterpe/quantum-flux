/*
 * 
 * flux.js */

var Flux = require('./lib/flux.js').Flux,
  _ = require('lodash');

var flux = new Flux();
//function Store() {}
//_.extend(Store.prototype, flux.Store.prototype);

var Store = flux.Store;

var store = new Store();

store.register(function (action) {
  console.log(action);
  console.log(this);
});

flux.dispatch({
  
  actionType: 'foo',
  
  error: null
});

module.exports = require('./lib/flux.js');
