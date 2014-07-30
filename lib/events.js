/*
 *
 * @module lib/events.js
 */
var _ = require('lodash');

/**
 * @class
 */
function EventEmitter() {
  "use strict";

  this._events = this._events || {};
}

_.extend(EventEmitter.prototype, {
  /**
   * @function EventEmitter#addListener
   * @param {string} channel,
   * @param {function} listener
   * @return {this}
   */
  addListener: function (channel, listener) {
    "use strict";
    var max = this._maxListeners !== undefined ? this._maxListeners : 10;

    EventEmitter.prototype.constructor.call(this);

    if (listener && _.isFunction(listener)) {
      if (!this._events[channel]) {
        this._events[channel] = [];
      } else if (max > 0 && this._events[channel].length > max && console) {
        console.warn('More than ' + max + ' listeners attached to event "' +
          channel + '"!');
      }
      if (this._events[channel].indexOf(listener) < 0) {
        this._events[channel].push(listener);
        this.emit('newListener', listener);
      }
    }

    return this;
  },
  /**
   * @function EventEmitter#once
   * @param {string} channel,
   * @param {function} listener
   * @return {this}
   */

  once: function (channel, listener) {
    "use strict";
    return this.addListener(channel, _.bind(function () {
      listener.apply(null, arguments);
      this.removeListener(channel, listener);
    }, this));
  },

  /**
   * @function EventEmitter#removeListener
   * @param {string} channel,
   * @param {function} listener
   * @return {this}
   */
  removeListener: function (channel, listener) {
    "use strict";
    var index;

    if (this._events && channel) {
      if (_.isUndefined(listener) && this._events[channel]) {
        return this.removeAllListeners(channel);
      }
      if (_.isFunction(listener) && this._events[channel]) {
        index = this._events[channel].indexOf(listener);

        if (index > -1) {
          this._events[channel].splice(index, 1);
          this.emit('removeListener', listener);
        }
      }
    }
    return this;
  },

  /**
   * @function EventEmitter#removeAllListeners
   * @param {string} channel,
   * @return {this}
   */
  removeAllListeners: function (channel) {
    "use strict";

    function remove(channel) {
      _.each(channel.splice(0, channel.length), function (removedListener) {
        this.emit('removeListener', removedListener);
      }, this);
    }

    if (this._events) {
      if (!channel) {
        _.each(this._events, remove, this);
      } else if (this._events[channel]) {
        remove.apply(this, this._events[channel]);
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
      channel = args.shift(),
      queue;

    if (this._events && this._events[channel]) {

      queue = _.map(this._events[channel], function (listener, index) {
        return listener;
      });

      _.each(queue, function (listener) {
        if (!this._events[channel] ||
            this._events[channel].indexOf(listener) < 0) {
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
   * @param {string} channel
   * @return {array}
   */
  listeners: function (channel) {
    "use strict";
    var listeners = [];

    if (this._events && this._events[channel]) {
      listeners = listeners.concat(this._events[channel]);
    }

    return listeners;
  },
  /**
   * @function EventEmitter#setMaxListeners
   * @param {integer} n
   */

  setMaxListeners: function (n) {
    "use strict";

    this._maxListeners = parseInt(n, 10);
  }

});

_.extend(EventEmitter.prototype, {
  /**
   * @function EventEmitter#on
   * @alias EventEmitter.addListener
   */
  on: EventEmitter.prototype.addListener
});

/**
 * @function EventEmitter.listenerCount
 * @param {EventEmitter} emitter
 * @param {string} channel
 * @return {integer}
 * @static
 */
EventEmitter.listenerCount = function (emitter, channel) {
  "use strict";
  if (emitter && channel && emitter._events) {
    return emitter._events[channel] ?
        emitter._events[channel].length : 0;
  }
};

module.exports = {
  EventEmitter: EventEmitter
};
