![quantum-flux](http://sterpe.github.io/quantum-flux/img/quantum-flux.jpg "")

====

[![Build Status](https://travis-ci.org/sterpe/quantum-flux.svg?branch=master)](https://travis-ci.org/sterpe/quantum-flux)


###Installation:
```
  npm install quantum-flux
```

###Basic Usage:

```javascript
  //Create a flux dispatcher. ********************************************
  
  var Quantum = require('quantum-flux');
  
  var flux = new Quantum();

  //Register a store. ****************************************************

  var store = {
    data: null
  };
  
  flux.register(store, function (payload) {
    //Do something when there is an appropriate payload
    switch (payload.isRelevant) {

    case "yes": 
      //update the store's data.
      this.data = payload.data;
      break;

    default:
      return;
    }
    //notify any listeners that there was a change.
    this.changed();
  });

  //Add a listener to this store. ****************************************

  store.onChange(function () {
    //do something with the store data when it's updated.
    console.log(store.data);
  });

  //Dispatch an action! **************************************************

  flux.dispatch({
    isRelevant: "yes",
    data: 42
  });

```
##API Documentation

###Quantum()
--
####Constructor
#####Parameters:
######none
```javascript
  var Quantum = require('quantum-flux');

  var flux = new Quantum();

```
###Quantum._dispatch(payload)_
--
#####Description:
Dispatch the argument `payload` to all registered stores.
#####Parameters
Name | Type | Description
--- | --- | --- |
`payload` |`any` | The thing to be dispatched, can be falsey.

#####Returns
`undefined`

#####Example
```javascript
  var flux = new Quantum(),

  flux.dispatch({
    actionType: 'first quantum dispatch!',
    value: 'hello, quantum-flux!'
  });

```
  
###Quantum._register(store, listener)_
--
#####Description:
Register a new store and it's listener with the dispatcher. 
If `store` is already registered with the dispatcher, changes stores current listening function to `listener`.
#####Parameters
Name | Type | Description
--- | --- | --- |
`store` |`{object}` | ``
`listener` |`{function}` | The store's callback for dispatches; will be called as: `listener.apply(store, [args]);`

#####Returns
`store`

#####Example

```javascript
  var flux = new Quantum();

  var store = {
    foo: "bar",
    fn: function (payload) {
      if (payload.actionType === "FOO_UPDATE") {
        this.foo = payload.value;
        this.changed();
      }
    }
  };
  
  flux.register(store, store.fn);
```
###Quantum._unregister(store)_
--
#####Description
Unregister `store` with the dispatcher. The listening function associated with `store` will no longer be informed about dispatch events.
#####Parameters
Name | Type | Description
--- | --- | --- |
`store` | `{object}` | The store to be unregistered with the flux dispatcher.
#####Returns
`store`

#####Example

```javascript
  //Assume `store` is a previously registered store.
  
  flux.unregister(store);
```
###Store._addChangeListener(func)_
###Store._removeChangeListener(func)_
###Store._changed([args])_
###Store._waitFor([stores], onFulfilled, onRejected)_
###Store._emit(e, [args])_
###Store._on(e, listener)_
--
#####Description
Register a `listener` for event `e`.

#####Parameters
Name | Type | Description
--- | --- | --- |
`e` | {string} | The event to register against.
`listener` | {function} | The listener to be called when the event is emitted.
#####Aliases
###### addEventListener(), addListener()



###Store._off(e, func)_ 

http://nodejs.org/api/events.html

##Advanced (Experimental) APIs

###Quantum._setImmediate(func)_
--
#####Description
Preempt the next dispatch in the dispatch queue with the async evaluation of `func`.  A browser repaint will be allowed both before and after `func` is evaluated, then dispatching will continue in it's "natural"* order.  If `func` dispatches an action with Quantum.dispatch(), that dispatch will also precede the natural queue order...and so on.

It can be hard to notice the effects of __setImmediate__ unless `func` issues a call to `Quantum#dispatch()` in all cases, however,  __setImmediate__ has the effect of "padding" the execution of `func` with browser repaints, i.e., it is asynchronous both before _and_ after.

#####Parameters
Name | Type | Description
--- | --- | --- |
`func`| `{function}` | The function to execute prior to the next dispatch in the "natural"* order.

\* We can define "natural" order as the order of dispatch events queued such that registered stores fire their own changed listeners and other events in attached order __and__ stores do this in in the order of dispatch resolution...i.e., if storeA waitedFor storeB, storeB fires it's own changes prior to storeA.

It's important to remember that the `quantum-flux` dispatcher supports recursive calls to dispatch as part of the natural order.

#####Example
```javascript
  var flux = new Quantum();

  var store1 = flux.register({}, function (p) {
    this.changed();
  });

  store1.addChangeListener(function () {
    console.log('logged synchronously');
  });

  var store2 = flux.register({}, function (p) {
    this.changed();
  });

  store2.addChangeListener(function (p) {
    flux.setImmediate(function () {
      //The thread 'sleeps' directly before this...browser can repaint.
      
      console.log('executed asynchronously, but still in order');
      
      //And 'sleeps' directly after this again...browser can repaint.
    });
  });

  flux.dispatch();

  //logged synchronously
  //executed asynchronously, but still in order
```
###Quantum._interlace()_
--
#####Description
Use maximum thread-sharing when processing flux-store dispatch digestion.  This will increase the number of browser repaints available and/or allow other javascript processes (such as timers) to run while stores digest the current dispatch.

If interlacing is already enabled, the call has no effect.

By default, the __quantum-flux__ dispatcher only thread-shares when processing a __waitFor()__ or __setImmediate()__ request.

#####Default
######thead-interlacing is disabled.
#####Parameters
######none
#####Returns
`undefined`
#####Example
```javascript
  var flux = new Quantum();

  flux.interlace();
  
```

###Quantum._deInterlace()_
--
#####Description
Turn off thread-interlacing if it has been enabled, otherwise has no effect. Interlacing is __disabled__ by default.
#####Default
######thread-interlacing is disabled.
#####Parameters
######none
#####Returns
`undefined`
#####Example
```javascript
  var flux = new Quantum();

  flux.interlace();
  flux.deInterlace();
  
```
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
  //If you just need a quick store...
  var aStore = new flux.Store();
  
  //Probably you'll eventually need to do something more complex,
  //the flux.Store constructor will extend the store with any properties passed it via a `conf` object.
  
  //We define the property `foo`, `funcB`, and `funcA` for `myStore` instance.
  var myStore = new flux.Store({
    foo: "bar",
    funcB: function () {/*...*/},
    funcA: function (payload) {
      //do something with the payload!
      
      //Store objects share the EventEmitter prototype -- they can emit events and attach listeners!
      this.emit('change', /*args to pass to this event*/);
    }
  });
```
####Registering and unregistering a store:

Now register this store and a listener function to the flux dispatcher!
```javascript

  var myStore = new flux.Store();
  
  //Note: the registered function will be called with `myStore` as the `this` value.
  myStore.register(function (payload) {
    this.emit('change');
  });
  
  //You can change or swap the registered function at any time and it takes effect immediately!
  myStore.register(myStore.funcA);
  
  //you can also unregister a store, the dispatcher will no longer send dispatches to this store.
  myStore.unregister();
```

####Stores are EventEmitters:

```javascript

  myStore.addListener('change', function listener(e /*, ...args */) {
    
    //have your View-controller do something in response to the event.
    
    myStore.removeListener(listener);  //You probably don't need to do this, but you can...
    
  });
  
  
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

When a store calls `this.emit(e, [args])`, that call is tied into to the dispatch phase/cycle...sort of like the way
machine guns on WWI aircraft were linked to the engine cycle, to avoid shooting off the propellor.  This is also similar to the way that AngularJS's $setTimeout function is tied into the Angular digest cycle, for those familiar with Angular.

`emit` calls are queued and fired in order synchronously, so we never have to worry about a browser redraw occuring between the point where all the stores have completed processing the dispatch and all listeners of those stores have executed their callbacks.

This is difficult to explain in words but consider this sample output--
  (stores are A,B,C,D,E --registered with the dispatcher in that order, and each store has 1 listener):

```
**CREATED NEW STORE** :: 97f68250-18f0-11e4-b902-bd789b968062
**CREATED NEW STORE** :: 97f83000-18f0-11e4-b902-bd789b968062
**CREATED NEW STORE** :: 97f83001-18f0-11e4-b902-bd789b968062
**CREATED NEW STORE** :: 97f83002-18f0-11e4-b902-bd789b968062
**CREATED NEW STORE** :: 97f83003-18f0-11e4-b902-bd789b968062
**CREATED NEW STORE** :: 97f83004-18f0-11e4-b902-bd789b968062


Dispatching payload: 1
Dispatching payload: 2
Dispatching payload: 3
Dispatching payload: 4
Dispatching payload: 5



 NEXT DISPATCH PHASE BEGINS -- PAYLOAD IS: 1


 The payload was "1" so D dispatched the payload "9"

 B waited for D

 The payload was '1' so B dispatched the payload '7'

 A waited for B

 The payload was "1" so B dispatched payload "8"

 E waited for D,B,C

Listener of A reporting. Payload was: 1
Listener of B reporting. Payload was: 1
Listener of C reporting. Payload was: 1
Listener of D reporting. Payload was: 1
Listener of E reporting. Payload was: 1
```

There shouldn't be dependency on side effects between listeners of separate stores for the same event.

We see in the sample flow above that regardless of who waited on who, all stores have completed their updates by the time any 
listeners have received the corresponding change events.  Also the listeners of each particular store are fired in store-dispatch registration order.

The important point here is that you should avoid creating implicit dependencies between listeners of separate stores for the
same event.  I.e., the `Listener of A` above, shouldn't have a dependency on any action performed by `Listener of B` and vice versa.  If you do have a need for those dependencies, consider handling them by dispatching the appropriate events through the dispatcher.

####Finally, if you really want to get crazy, you can extend from the Store.prototype:

```javascript

function myCustomComplicatedStore {

//Yadda, yadda, yadda...

}

favoriteExtendFunc(myCustomComplicatedStore.prototype, flux.Store.prototype);

//Wha-la.
```

