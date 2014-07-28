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
var store2 = new Store();

store.register(function (action) {
  
  this.waitFor(store2, _.bind(function (action) {
    console.log('delayed', action);
    console.log(this);
  }, this));
  console.log(this);
});


store2.register(function (action) {
  this.waitFor(store, _.bind(function (action) {
    console.log('waiting....done.');
  }, this));
  console.log(this);
});

flux.dispatch({
  
  actionType: 'foo',
  
  error: null
});

module.exports = require('./lib/flux.js');
