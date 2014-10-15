var through2 = require('through2')
, setImmediate = (require('setImmediate'), global.setImmediate)
, clearImmediate = (require('setImmediate'), global.clearImmediate)
, invariant = require('invariant')
, _ = require('lodash')
, Q = require('q')
;

function register(callback) {
	var store
	;
	store = this._stores[++this._id] = {};
	store.id = this._id;
	store.callback = function (payload) {
		try {
			store.state = 'active';
			callback.call(void 0, payload);
			store.state = 'complete';
			store.deferred.resolve(0);
		} catch (e) {
			store.state = 'complete';
			store.deferred.reject(e);
		}
	};
	store.stream = through2.obj(function (payload, enc, done) {
		store.immediate = setImmediate(function () {
			store.callback.call(void 0, payload);
		});
		store.state = 'queued';
		this.push(payload);
		done();
	});
	return store.id;
}
function unregister(id) {
	invariant(
		this._stores[id],
		'Dispatcher.unregister(...): `%s` does not map to a ' +
			'registered callback.',
		id
	);
	this.unpipe(this._stores[id].stream);
	clearImmediate(this._stores[id].immediate);
	delete this._stores[id];
}
function waitFor(ids) {
	invariant(
		this._isDispatching,
		'Dispatcher.waitFor(...): Must be invoked while ' +
			'dispatching.'
	);
	_.forEach(ids, function (id, i) {
		invariant(
			this._stores[id],
			'Dispatcher.waitFor(...): `%s` does not map ' +
				'to a registered callback.',
			id
		);
		invariant(
			!(this._stores[id].state === 'active'),
			'Dispatcher.waitFor(...): Circular ' +
				'dependency detected while waiting ' +
					'for `%s`.',
			id
		);
		if (this._stores[id].state === 'complete') {
			return;
		}
		if (this._stores[id].state === 'pending') {
			this.unpipe(this._stores[id].stream);
		} else if (this._stores[id].state === 'queued') {
			clearImmediate(this._stores[id].immediate);
		}
		this._stores[id].callback.call(void 0,
			this._pendingPayload);
	}, this);
}
function dispatch(payload) {
	invariant(
		!this._isDispatching,
		'Dispatch.dispatch(...): Cannot dispatch in the ' +
			'middle of a dispatch.'
	);
	this._startDispatching(payload);
}
function isDispatching() {
	return this._isDispatching;
}
function _startDispatching(payload) {
	var promises = []
	, that = this
	;
	_.forEach(this._stores, function (store, id) {
		store.deferred = Q.defer();
		store.status = 'pending';
		store.immediate = null;
		promises.push(store.deferred.promise);
		that.pipe(store.stream);
	});
	this._pendingPayload = payload;
	this._isDispatching = true;
	Q.allSettled(promises).then(function (results) {
		console.log('settling promises');
//		that._stopDispatching();
	});
	console.log('pushing payload');
	this.push(payload);
}
function _stopDispatching() {
	var that = this
	;
	_.forEach(this._stores, function (store, id) {
		store.deferred = store.status = store.immediate = null;
	});
	this.unpipe();
	this._pendingPayload = null;
	this._isDispatching = false;
}
function Dispatcher() {
	var self
	;
	self = through2.obj();

	_.extend(self, {
		_id: 0,
		_stores: {},
		_isDispatching: false,
		register: register,
		unregister: unregister,
		waitFor: waitFor,
		dispatch: dispatch,
		isDispatching: isDispatching,
		_startDispatching: _startDispatching,
		_stopDispatching: _stopDispatching
	});

	return self;
}

module.exports = {
	Dispatcher: Dispatcher
};
