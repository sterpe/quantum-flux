var _ = require('lodash');

/**
 * @class
 */
function EventEmitter() {
  "use strict";

  this.__eventEmitter = this.__eventEmitter || {
    events: {},
    maxListeners: 10
  };
}

_.extend(EventEmitter.prototype, {
  /**
   * @function EventEmitter#addListener
   * @param {string} e,
   * @param {function} listener
   * @return {this}
   */
  addListener: function (e, listener) {
    "use strict";
    //var max = this._maxListeners !== undefined ? this._maxListeners : 10;
    var self,
      max;


    EventEmitter.prototype.constructor.call(this);
    self = this.__eventEmitter;
    max = self.maxListeners;

    if (listener && _.isFunction(listener)) {
      if (!self.events[e]) {
        self.events[e] = [];
      } else if (max > 0 && self.events[e].length > max && console) {
        console.warn('More than ' + max + ' listeners attached to event "' +
          e + '"!');
      }
      if (self.events[e].indexOf(listener) < 0) {
        self.events[e].push(listener);
        this.emit('newListener', listener);
      }
    }

    return this;
  },
  /**
   * @function EventEmitter#once
   * @param {string} e,
   * @param {function} listener
   * @return {this}
   */

  once: function (e, listener) {
    "use strict";
    var bound = _.bind(function () {
      listener.apply(null, arguments);
      this.removeListener(e, bound);
    }, this);

    return this.addListener(e, bound);
  },

  /**
   * @function EventEmitter#removeListener
   * @param {string} e,
   * @param {function} listener
   * @return {this}
   */
  removeListener: function (e, listener) {
    "use strict";
    var self,
      index;

    EventEmitter.prototype.constructor.call(this);

    self = this.__eventEmitter;

    if (self.events && e) {
      if (_.isUndefined(listener) && self.events[e]) {
        return this.removeAllListeners(e);
      }
      if (_.isFunction(listener) && self.events[e]) {
        index = self.events[e].indexOf(listener);

        if (index > -1) {
          self.events[e].splice(index, 1);
          this.emit('removeListener', listener);
        }
      }
    }
    return this;
  },

  /**
   * @function EventEmitter#removeAllListeners
   * @param {string} e,
   * @return {this}
   */
  removeAllListeners: function (e) {
    "use strict";

    var self;

    function remove(e) {
      _.each(e.splice(0, e.length), function (removedListener) {
        this.emit('removeListener', removedListener);
      }, this);
    }

    EventEmitter.prototype.constructor.call(this);

    self = this.__eventEmitter;
    if (self.events) {
      if (!e) {
        _.each(self.events, remove, this);
      } else if (self.events[e]) {
        remove.call(this, self.events[e]);
      }
    }

    return this;
  },
  /**
   * @function EventEmitter#emit
   */

  emit: function () {
    "use strict";
    var args = Array.prototype.slice.call(arguments),
      e = args.shift(),
      queue,
      self;

    EventEmitter.prototype.constructor.call(this);

    self = this.__eventEmitter;

    if (self.events && self.events[e]) {

      queue = _.map(self.events[e], function (listener, index) {
        return listener;
      });

      _.each(queue, function (listener) {
        if (!self.events[e] ||
            self.events[e].indexOf(listener) < 0) {
          return;
        }
        listener.apply(undefined, args);
      }, this);

      return queue.length > 0;
    }

    return false;
  },

  /**
   * @function EventEmitter#listeners
   * @param {string} e
   * @return {array}
   */
  listeners: function (e) {
    "use strict";
    var self,
      listeners = [];

    EventEmitter.prototype.constructor.call(this);

    self = this.__eventEmitter;

    if (self.events && self.events[e]) {
      listeners = listeners.concat(self.events[e]);
    }

    return listeners;
  },

  /**
   * @function EventEmitter#setMaxListeners
   * @param {integer} n
   */
  setMaxListeners: function (n) {
    "use strict";
    var self;

    EventEmitter.prototype.constructor.call(this);

    if (n || n === 0) {
      self = this.__eventEmitter;
      self.maxListeners = parseInt(n, 10);
    }
  }

});

/*
 * Aliasing...
 */

_.extend(EventEmitter.prototype, {
  on: EventEmitter.prototype.addListener,
  off: EventEmitter.prototype.removeListener,
  addEventListener: EventEmitter.prototype.addListener,
  removeEventListener: EventEmitter.prototype.removeListener
});

/**
 * @function EventEmitter.listenerCount
 * @param {EventEmitter} emitter
 * @param {string} e
 * @return {integer}
 * @static
 */

EventEmitter.listenerCount = function (emitter, e) {
  "use strict";
  if (emitter && e && emitter.__eventEmitter.events) {
    return emitter.__eventEmitter.events[e] ?
        emitter.__eventEmitter.events[e].length : 0;
  }
};

module.exports = {
  EventEmitter: EventEmitter
};
