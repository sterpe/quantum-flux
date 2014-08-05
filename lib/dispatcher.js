/**
 *
 * @module lib/dispatcher.js
 */

var _ = require('lodash'),
  EventEmitter = require('./events.js').EventEmitter,
  TaskProcessQueue = require('./task_queue.js'),
  Store = require('./store.js'),
  Q = require('q');


/**
 * Creates a new Dispatcher.
 * @class
 */

function Dispatcher() {
  "use strict";

  this.__dispatcher = this.__dispatcher || (_.bind(function () {

    this.onStoreWaitFor = _.bind(this.onStoreWaitFor, this);

    this.drainEmitQueue = _.bind(this.drainEmitQueue, this);

    this.onStoreEmit = _.bind(this.onStoreEmit, this);

    this.addEventListener('processEnd', function () {
      console.log('processEnd');
    });

    this.addEventListener('processEnd', this.drainEmitQueue);

    this.addEventListener('taskEnd', function () {
      console.log('taskEnd');
    });

    this.addEventListener('processStart', function () {
      console.log('processStart');
    });
    this.addEventListener('taskStart', function () {
      console.log('taskStart');
    });
    this.addEventListener('taskStart', this.drainEmitQueue);

    this.addEventListener('taskClear', function () {
      console.log('taskClear');
    });

    this.addEventListener('taskClear', this.drainEmitQueue);

    this.addEventListener('processHalt', function () {
      console.log('processHalt');
    });
    this.addEventListener('processSleep', function () {
      console.log('processSleep');
    });

    return {
      snapshots: [],
      emitQueue: [],
      storesData: {}
    };

  }, this)());
}

_.extend(
  Dispatcher.prototype,
  TaskProcessQueue.prototype,
  EventEmitter.prototype
);

_.extend(Dispatcher.prototype, {

  drainEmitQueue: function () {
    "use strict";
    var self,
      stack = [];


    self = this.__dispatcher;

    this.snapshot();
    while (self.emitQueue.length) {
      stack.push(self.emitQueue.pop());
    }
    while (stack.length) {
      stack.pop().call();
      while (self.emitQueue.length) {
        stack.push(self.emitQueue.pop());
      }
    }
  },

  snapshot: function () {
    "use strict";
    var self;

    self = this.__dispatcher;

    if (false) {
      //Not really sure how generally useful this is...
      self.snapshots.push(JSON.stringify(_.map(self.storesData,
        function (data, key) {
          var obj = {};
          obj[key] = data.store;
          return obj;
        })));
    }
  },
  register: function (store, listener) {
    "use strict";
    var self;

    Dispatcher.prototype.constructor.call(this);
    Store.prototype.constructor.call(store);

    self = this.__dispatcher;


    if (self.storesData[store.guid()] !== undefined) {
      this.unregister(store);
    }

    self.storesData[store.guid()] = {
      store: store,
      deferred: null,
      currentlyWaiting: false,
      currentlyWaitingFor: [],
      callback: _.bind(function (payload) {
        try {
          listener.call(store, payload);
          if (!self.storesData[store.guid()].currentlyWaiting) {
            self.storesData[store.guid()].deferred.resolve(payload);
          }
        } catch (e) {
          console.log(e);
          self.storesData[store.guid()].deferred.reject(e);
        }
      }, this)
    };

    store.on('store#waitFor', this.onStoreWaitFor);
    store.on('store#emit', this.onStoreEmit);
    this.on('#channel', self.storesData[store.guid()].callback);

    return store;
  },

  unregister: function (store) {
    "use strict";

    var self;

    Dispatcher.prototype.constructor.call(this);

    self = this.__dispatcher;

    if (!(store.guid && store.__store) || !self.storesData[store.guid()]) {
      return store;
    }
    store.off('store#waitFor', this.onStoreWaitFor);
    this.off('#channel', self.storesData[store.guid()].callback);
    delete self.storesData[store.guid()];

    return store;
  },

  onStoreWaitFor: function (wait) {
    "use strict";

    var self,
      cyclicFailureError;

    Dispatcher.prototype.constructor.call(this);

    self = this.__dispatcher;

    if (!_.isArray(wait.targets)) {
      wait.targets = [wait.targets];
    }

    _.each(wait.targets, function (target) {
      if (target === wait.store) {
        cyclicFailureError = 'A store can\'t wait on itself!';
      }
    });

    if (cyclicFailureError) {
      throw new Error(cyclicFailureError);
    }

    self.storesData[wait.store.guid()].currentlyWaiting = true;
    self.storesData[wait.store.guid()].currentlyWaitingFor =
      [].concat(wait.targets);

    this.halt(); //Halt the processing queue;

    Q.all(_.filter(_.map(self.storesData, function (data) {
      return wait.targets.indexOf(data.store) !== -1 ?
          data.deferred.promise : false;
    }), _.identity))

      .then(function (x) {
        var payload = x.pop();

        wait.onFulfilled.call(wait.store, payload);

        return payload;

      }, function (e) {
        wait.onRejected.call(wait.store, e);
        throw e;
      })

      .then(function (payload) {
        self.storesData[wait.store.guid()].deferred.resolve(payload);
      }, function (e) {
        self.storesData[wait.store.guid()].deferred.reject(e);
      })

      .finally(function () {
        self.storesData[wait.store.guid()].currentlyWaiting = false;
        self.storesData[wait.store.guid()].currentlyWaitingFor = [];
      });
  },

  onStoreEmit: function (fn) {
    "use strict";
    var self;

    self = this.__dispatcher;

    self.emitQueue.push(fn);
  },

  dispatch: function (payload) {
    "use strict";

    var self;

    Dispatcher.prototype.constructor.call(this);

    self = this.__dispatcher;

    this.enqueue(_.bind(function () {
      self.deferreds = {};

      _.each(self.storesData, function (storeData, key) {
        storeData.deferred =  Q.defer();
      });

      this.emit('#channel', payload);
    }, this));

  },

  thread: function () {
    "use strict";
    
    var self;

    Dispatcher.prototype.constructor.call(this);

    this.enqueue(_.bind(this.interlace, this));
  },

  dethread: function () {
    "use strict";
    
    var self;

    Dispatcher.prototype.constructor.call(this);

    this.enqueue(_.bind(this.deinterlace, this));
  },

  setImmediate: function (fn) {
    "use strict";

    var self;

    Dispatcher.prototype.constructor.call(this);
    //this.unshift(fn);
    this.unshift(_.bind(function() {
      //this.interlace();
      this.thread();
      this.enqueue(fn);
      this.dethread();
    },this));
  }

});

module.exports = {
  Dispatcher: Dispatcher
};


