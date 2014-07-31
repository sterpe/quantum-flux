quantum-flux
====

A clean and understandable API that provides async, integrated, stores and
dispatchers for Facebook's React Framework(tm).

####Create a new flux instance for your application:

```javascript

  var quantum = require('quantum-flux');
  
  var flux = new quantum.FluxInstance();
  
  //dispatch a payload, it can be anything, though you'll probably prefer to use objects.

  flux.dispatch('hello, quantum flux!');

```

####Create a new store:

Any properties attached to the config object passed into the flux.Store constructor are attached to `this` store.
  
```javascript
  
  var myStore = new flux.Store({
    foo: "bar",
    funcB: function () {/*...*/},
    funcA: function (payload) {
      //do something with the payload!
      
      this.emit('change', /*args to pass to this event*/);
    }
  });
```
####Registering and unregistering a store:

Now register this store and a listener function to the flux dispatcher!
```javascript

  var myStore = new flux.Store();
  
  //Note: the registered function will be called with `myStore` as the `this` value.
  myStore.register(function () {});
  
  //Change the registered function, can be done even in response to a dispatch and takes effect on next dispatch!
  myStore.register(myStore.funcA);
  
  //you can also unregister a store, the dispatcher will no longer send dispatches to this store.
  myStore.unregister();
```

####Stores are EventEmitters:

```javascript

  //Stores share the EventEmitter* prototype so components can register to listen to their events.
  //This lets stores and listeners communicate a variety of events, besides just `change`.
  myStore.addListener('change', function l(e /*, ...args */) {
    
    //do something in response to the event.
    
    myStore.removeListener(l);  //You probably don't need to do this, but you can...
  });
  
  // Basically works like node EventEmitter except that removal behavior is consistent with
  //in-browser removeEventListener, not node's removeListener.
  
```

####Waiting for other Stores:

Stores can wait for another store or stores.

```javascript

var storeA = new flux.Store(),
  storeB = new flux.Store();
  
  storeA.register(function (payload) {
    
    switch (payload.someCondition) {
    
      case foo:
        this.waitFor(storeB /* or an [ ] of stores! */, function onFulfilled (payload) {
        
          //do something now that storeB is done
        
          this.emit('change');
        }, function onError (e) {
        
          //do whatever in case there was an error in storeB
        });
        break;
        
      default:
        return;
    }
    
  });
  
```

####All emits that occured during a dispatch phase are handled, in registration order, synchronously.

In the example above, if both storeA & storeB emit events to their listeners, storeA's eventListeners will be called,
before storeB's, even though storeA waited on storeB.

All emits are handled synchronously, in registration order, the browser will not re-render until all store event listeners have had a chance to execute.

####You can extend from the Store.prototype:

```javascript

function myCustomComplicatedStore {

//Yadda, yadda, yadda...

}

extendFunc(myCustomComplicatedStore, flux.Store);

//Wha-la.
```

