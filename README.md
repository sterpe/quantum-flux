![quantum-flux](http://sterpe.github.io/quantum-flux/img/quantum-flux.jpg "")

====

[![Build Status](http://travis-ci.org/sterpe/quantum-flux.svg?branch=master)](http://travis-ci.org/sterpe/quantum-flux)


###Installation
```
  npm install quantum-flux
```

###Table of Contents
  + [Introduction](http://github.com/sterpe/quantum-flux/blob/master/README.md#introduction)
  + [Why quantum-flux?](http://github.com/sterpe/quantum-flux/blob/master/README.md#why-quantumflux)
  + [Basic Usage](http://github.com/sterpe/quantum-flux/blob/master/README.md#basic-usage)
  + [API Documentation](http://github.com/sterpe/quantum-flux/blob/master/README.md#api-documentation)
    + [Dispatcher] (http://github.com/sterpe/quantum-flux/blob/master/README.md#the-dispatcher)
      + [Quantum.constructor()] (http://github.com/sterpe/quantum-flux/blob/master/README.md#quantum)
      + [Quantum.dispatch(payload)] (http://github.com/sterpe/quantum-flux/blob/master/README.md#quantumdispatch)
      + [Quantum.register(store, listener)] (http://github.com/sterpe/quantum-flux/blob/master/README.md#quantumregister)
      + [Quantum.unregister(store)](http://github.com/sterpe/quantum-flux/blob/master/README.md#quantumunregister)
    + [Stores] (http://github.com/sterpe/quantum-flux/blob/master/README.md#the-stores)
      + [About Stores] (http://github.com/sterpe/quantum-flux/blob/master/README.md#about-stores)
      + [Store.waitFor([stores], onFulfilled, onRejected)] (http://github.com/sterpe/quantum-flux/blob/master/README.md#storewaitfor)
      + [Store.addChangeListener(func)] (http://github.com/sterpe/quantum-flux/blob/master/README.md#storeaddchangelistener)
      + [Store.removeChangeListener(func)] (http://github.com/sterpe/quantum-flux/blob/master/README.md#storeremovechangelistener)
      + [Store.changed([args])] (http://github.com/sterpe/quantum-flux/blob/master/README.md#storechanged)
    + [Advanced APIs] (http://github.com/sterpe/quantum-flux/blob/master/README.md#advanced-apis)
      + [Quantum.setImmediate(func)] (http://github.com/sterpe/quantum-flux/blob/master/README.md#quantumsetimmediate)
      + [Quantum.interlace()] (http://github.com/sterpe/quantum-flux/blob/master/README.md#quantuminterlace)
      + [Quantum.deInterlace()] (http://github.com/sterpe/quantum-flux/blob/master/README.md#quantumdeinterlace)
  + [Contributing to Quantum Flux] (http://github.com/sterpe/quantum-flux/blob/master/README.md#contributing-to-quantum-flux)

###Introduction
__Flux__ is the data-flow architecture associated with the React UI Framework.  In brief it proposes an application composed of three major parts: the dispatcher, it's stores, and their views (React Components).

Data flows through such an application in a single, cyclic, direction:

```smalltalk
Views ---> (actions) ---> Dispatcher ----> (callback) ----> Stores ----+
^                                                                      |
|                                                                      V
+--------( "change" event handlers) <------ ("change" events) ---------+
```

Views generate actions, propogated to a dispatcher, the dispatcher informs
data stores about the event and they update themselves appropriately, stores
fire "change" events which views listen to vis-a-vis event handlers and so on...a single glorious cycle.

A full introduction to Flux Architecture can be found @ http://facebook.github.io/react/docs/flux-overview.html 

###Why quantum-flux?

Because all actions in an application propogate to the application dispatcher, which in turn funnels them universally to all application stores, there is a natural single-thread processing bottleneck that will occur as an application grows. 

In a hypothetically large application with many stores and many more actions, it begins to make sense to think about the idea of _asynchronous_ dispatch resolution, enabling Javascript based-timers, CSS animations, and UI interactions to continue while the dispatch phase of a flux-cycle complete.

An asynchronous dispatcher would allow the application to queue up additional call to the dispatcher (even recursive calls) processing them asynchronously, while ensuring that stores own change event handlers were themselves called synchronously and in the correct total ordering of events.

In effect we enforce a total state transition between two phases: a dispatch or "action" phase and the render or "react" phase.  It looks something like this:

```smalltalk
                                                        
           An action occurs,                                        
            moving application into a still                 Application state (all stores)
            resolving state that is neither               is now fully transitioned from 
              fully A nor B                                     state A to B.
              |                   --->                               |  
              |       -->> Asynchronous Resolution Phase -->         |
   STATE  A   |                           -->                        |     STATE B
              V          (ACTION/FLUX  PHASE)                        V  (REACT PHASE) 
Views ---> (actions) ---> Dispatcher ----> (callback) ----> Stores ----+
^                                                                      |   
|                                                                      V
+--------( "change" event handlers) <------ ("change" events) ---------+
   ^
   |                <-- Synchronous Resolution Phase <--
   |
  (END REACT PHASE)
 1x BROWSER REPAINT, STATE B

```
This is _**quantum-flux**_.

###Basic Usage

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
#API Documentation
--
##the dispatcher
###Quantum
`Quantum()`

--
####Constructor
#####Parameters
######none
#####Example
```javascript
  var Quantum = require('quantum-flux');

  var flux = new Quantum();

```

--
###Quantum.dispatch
`Quantum.dispatch(payload)`

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
--  
###Quantum.register
`Quantum.register(store, listener)`

--
#####Description:
Register a new store and it's listener with the dispatcher. 
If `store` is already registered with the dispatcher, changes stores current listening function to `listener`.
#####Parameters
Name | Type | Description
--- | --- | --- |
`store` |`{object}` | The dispatcher will automatically extend "plain" `Objects` with `Quantum.Store.prototype`.
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
--
###Quantum.unregister
`Quantum.unregister(store)`

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
--
##the stores
####About Stores
Stores implement an EventEmitter prototype very similiar to the [Node.js EventEmitter](http://nodejs.org/api/events.html) prototype with one exception:  the behavior of removeListener is consistent with the browser behavior of removeEventListener not Node's removeListener behavior.

Please consult the Node.js documentation for complete API documentation for the EventEmitter prototype:

http://nodejs.org/api/events.html
####Example

```javascript
var flux = new Quantum;

var store = {};

flux.register(store, function () {});

var f1 = function () {
  store.removeListener('change', f2); // or aliases - #removeEventListener() or #off()
};

var f2 = function () {
};

store.addListener('change', f1); //or aliases - #addEventListener() or #on()
store.addListener('change', f2);

store.emit('change');

//f2 was not called, as f1 removed it.  This is consistent with the
//in browser behavior of `removeEventListener`.
 
//In node.js f2 would have been called, but would not be called the
//next time the `change` event was fired.
```

###Store.waitFor
`Store.waitFor([stores], onFulfilled, onRejected)`

--
#####Description
When called inside a stores registered dispatch handler, instructs the
dispatcher to defer execution of the onFulfilled or onRejected callbacks until the store or array of stores specified by `[stores]` have first completedthe current dispatch cycle.

--
###Store.addChangeListener
`Store.addChangeListener(func)`

--
#####Description
A convenience method for:

```javascript
Store.on('change', func);
```
#####Parameters
Name | Type | Description
--- | --- | --- |
`func` | `{function}`| The function handler for store change events.
#####returns
`undefined`
#####Aliases
######onChange()
#####Example

```javascript
var flux = new Quantum();

var store = {};

flux.register(store, function () {});

var f = function () { /*...*/ };

store.addChangeListener(f);

```
--
###Store.removeChangeListener
`Store.removeChangeListener(func)`

--
#####Description
A convenience method for:

```javascript
Store.off('change', func);
```
#####Parameters
Name | Type | Description
---| --- | --- |
`func` | `{function}` | The handler to desubscribe from change events.
#####returns
`undefined`
#####Aliases
######offChange()
#####Example

```javascript
var flux = new Quantum();

var store = {};

flux.register(store, function () {});

var f = function () { /*...*/ };

store.addChangeListener(f);

//stop listening to this store's change event with `f`
store.removeChangeListener(f);
```
--
###Store.changed
`Store.changed([args])`

--
#####Description
A convenience method for:

```javascript
Store.emit('change', /* [args] */);
```
#####Parameters
Name | Type | Description
--- | --- | --- |
`args...` | `any` | Optional arguments to pass to event listeners for the change event.
#####Returns
`undefined`

#####Example

```javascript
var flux = new Quantum();
var store = {};

flux.register(store, function (payload) {
  if (payload.isRelevantToThisStore) {

    //it updates the store appropriately.

    this.changed();
  }
})

store.onChange(/*...etc...*/);
```

##Advanced APIs

###Quantum.setImmediate
`Quantum.setImmediate(func)`

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
###Quantum.interlace
`Quantum.interlace()`

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

###Quantum.deInterlace
`Quantum.deInterlace()`

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

##Contributing to Quantum Flux

* 2 space indentation
* 80 columns
* Include unit tests in your pull requests
