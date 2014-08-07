/**
 *
 * @module lib/store.js
 */

var _ = require('lodash'),
  uuid = require('node-uuid'),
  Q = require('q'),
  EventEmitter = require('./events.js').EventEmitter;




function Store() {
  "use strict";

  this.__store = this.__store || (_.bind(function () {

    var guid = uuid.v1();

    _.extend(this, Store.prototype);
    console.log('**CREATED NEW STORE** :: ' + guid);

    return {
      guid: guid
    };

  }, this)());
}

_.extend(Store.prototype, EventEmitter.prototype);

_.extend(Store.prototype, {

  guid: function () {
    "use strict";
    var self;

    Store.prototype.constructor.call(this);

    self = this.__store;
    return self.guid;
  },

  addChangeListener: function (f) {
    "use strict";

    Store.prototype.constructor.call(this);
    this.on('change', f);
  },

  removeChangeListener: function (f) {
    "use strict";

    Store.prototype.constructor.call(this);
    this.off('change', f);
  },

  changed: function () {
    "use strict";

    var args = Array.prototype.slice.call(arguments);
    args.unshift('change');
    this.emit.apply(this, args);
  },

  waitFor: function (targets, onFulfilled, onRejected) {
    "use strict";

    var deferred = Q.defer(),
      emit = _.bind(EventEmitter.prototype.emit, this);

    Store.prototype.constructor.call(this);

    emit('store#waitFor', {
      store: this,
      targets: targets,
      onFulfilled: onFulfilled,
      onRejected: onRejected,
      deferred: deferred
    });

    return deferred.promise;
  },
  emit: function () {
    var args = Array.prototype.slice.call(arguments),
      emit = _.bind(EventEmitter.prototype.emit, this);

    args.unshift(this);
    args.unshift(EventEmitter.prototype.emit);

    emit('store#emit', _.bind.apply(_, args));
  }
});

_.extend(Store.prototype, {
  onChange: Store.prototype.addChangeListener,
  offChange: Store.prototype.removeChangeListener
});
module.exports = Store;
