var events = require('events')
, util = require('util')
;

function EventEmitter() {
	EventEmitter._super.call(this);
}

util.inherits(EventEmitter, events.EventEmitter);

//Modifying the `emit` method of the prototype to conform to
//DOM-like behavior...listeners removed by another listener in the 
//same round do not fire.

EventEmitter.prototype.emit = function (type) {
	var er, handler, len, args, i, listeners;

	if (!this._events)
		this._events = {};

	// If there is no 'error' event listener then throw.
	if (type === 'error') {
		if (!this._events.error ||
				(typeof this._events.error === 'object' &&
				 !this._events.error.length)) {
			er = arguments[1];
			if (this.domain) {
				if (!er) er = new TypeError('Uncaught, unspecified "error" event.');
				er.domainEmitter = this;
				er.domain = this.domain;
				er.domainThrown = false;
				this.domain.emit('error', er);
			} else if (er instanceof Error) {
				throw er; // Unhandled 'error' event
			} else {
				throw TypeError('Uncaught, unspecified "error" event.');
			}
			return false;
		}
	}

	handler = this._events[type];

	if (typeof handler === 'undefined')
		return false;

	if (this.domain && this !== process)
		this.domain.enter();

	if (typeof handler === 'function') {
		switch (arguments.length) {
			// fast cases
			case 1:
				handler.call(this);
				break;
			case 2:
				handler.call(this, arguments[1]);
				break;
			case 3:
				handler.call(this, arguments[1], arguments[2]);
				break;
			// slower
			default:
				len = arguments.length;
				args = new Array(len - 1);
				for (i = 1; i < len; i++)
					args[i - 1] = arguments[i];
				handler.apply(this, args);
		}
	} else if (typeof handler === 'object') {
		len = arguments.length;
		args = new Array(len - 1);
		for (i = 1; i < len; i++)
			args[i - 1] = arguments[i];

		listeners = handler.slice();
		len = listeners.length;
		for (i = 0; i < len; i++) {
			//Don't execute listeners removed by another
			//listener in this round.
			if (handler.indexOf(listeners[i]) !== -1)
				listeners[i].apply(this, args);
		}
	}

	if (this.domain && this !== process)
		this.domain.exit();

	return true;
}
module.exports = {
	EventEmitter: EventEmitter
};
