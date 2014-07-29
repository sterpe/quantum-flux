/*
 * 
 * test.js */
  var Flux = require('./lib/flux.js').Flux;
  var flux = new Flux(),
    _ = require('lodash');

  var Store = flux.Store;

  var storeA = new Store({ 
    foo: "bar",
    otherFunc: function (x) {
      this.waitFor(store3, function (x) {
      console.log('storeA, otherfunc', x);
      if (x == 42) {
        flux.dispatchForceNextTick("24");
        flux.dispatch("24");
      }
    });
    },
    someFunc: function (x) {
      console.log('storeA', x);
      this.unregister();
      this.register(this.otherFunc);
    }
  });

  storeA.register(storeA.someFunc);

  //Later...

  //logs: 'storeA', 'hello, world'

  //change the registered function 

  //unregister a store if you want to take it out of service.

  //Or extend a custom constructor from the Store.prototype...

  var Store1Factory = function () {
    //very complex store initialization code here...
  };
  
  _.extend(Store1Factory.prototype, Store.prototype);
  
  var store1 = new Store1Factory();

  var store2 = new Store();
 
  //Register an anonymous function (will be called with store as `this`);
  store1.register(function () {
    var promise = this.waitFor(store2, function (x) {
      console.log('store1', x);
    }, function (e) {
      console.log(e);
    });
  });

  store2.register(function (x) {
    console.log('store2', x);
  });

  var store3 = new Store();
  store3.register(function () {
    this.waitFor(store1, function (x) {
      console.log('store3', x);
    });
  });

  //logs:
  // 'store2 responded',
  // 'store1', '42'


  //Stores extend EventEmitter.prototype
  
  var storeC = new Store();
  storeC.register(function (payload) {
    this.emit('change', payload, payload.foo);
  });

  storeC.addListener('change', function (foo) {
    console.log('StoreC: foo was ', foo);
  });


  flux.dispatch('hello, world');
  flux.dispatch('42');
  flux.dispatch({
    foo: "bar"
  });
  //logs:
  // 'foo was bar'

  

