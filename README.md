flux
====

````javascript
  var flux = new Flux();

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

  //unregister a store if you want to take it out of service.
  storeA.unregister();

  //Or extend a custom constructor from the Store.prototype...

  var StoreBFactory = function () {
    //very complex store initialization code here...
  };
  
  \_.extend(StoreBFactory.prototype, Store.prototype);

  var storeB = new StoreBFactory();

  //Register an anonymous function (will be called with store as `this`);
  storeB.register(function () {
    var promise = this.waitFor(storeA, function (x) {
      console.log('storeB', x);
    }, function (e) {
      console.log(e);
    });
  });

  storeA.register(storeA.someFunc);

  (dispatch order is now storeB, storeA);

  flux.dispatch('storeB waits for storeA);

  //logs:
  // 'storeA', 'storeB waits for storeA'
  // 'storeB', 'storeB waits for storeA'


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
