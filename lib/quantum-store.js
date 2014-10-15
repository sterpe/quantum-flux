var EventEmitter = require('./quantum-events').EventEmitter
, util = require('util')
, extend = require('extend')
, prototype = Store.prototype
, _slice = []["__proto__"].slice
;

function Store(opts) {
	Store._super.call(this);
	extend(this, opts);
}

util.inherits(Store, EventEmitter);

extend(prototype, {
	off: function() {
		this.removeListener.apply(this, arguments);
	},
	addEventListener: function () {
		this.addListener.apply(this, arguments);
	},
	removeEventListener: function () {
		this.removeListener.apply(this, arguments);
	},
	onChange: function () {
		var args = _slice.call(arguments)
		;
		args.unshift('change');
		this.addListener.apply(this, args);
	},
	emit: function () {
		var args = _slice.call(arguments)
		;
		if (args.length === 0) {
			args.push('change');
		}
		EventEmitter.prototype.emit.apply(this, args);
	}
});

module.exports = Store;

