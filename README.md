quantum-flux
====

A clean and understandable API that provides async, integrated, stores and
dispatchers for Facebook's React Framework(tm).


````javascript
  var flux = new Flux(),
    _ = require('lodash');

  var Store = flux.Store;

  var storeA = new Store({ 
    foo: "bar",
    someFunc: function (x) {
      console.log('storeA', x);
    }
  });

  storeA.register(storeA.someFunc);

  //Later...
  flux.dispatch('hello, world');

  //logs: 'storeA', 'hello, world'

  //change the registered function 
  storeA.register(function () {});

  //unregister a store if you want to take it out of service.
  storeA.unregister();

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

  store2.register(function () {
    console.log('store2 responded');
  });


  flux.dispatch('42');

  //logs:
  // 'store2 responded',
  // 'store1', '42'


  //Stores extend EventEmitter.prototype

  var storeC = new Store().register(function (payload) {
    this.emit('change', payload.foo);
  });

  storeC.addListener('change', function (foo) {
    console.log('foo was ' + foo);
  });

  flux.dispatch({
    foo: "bar"
  });

  //logs:
  // 'foo was bar'

  
  
  
````
