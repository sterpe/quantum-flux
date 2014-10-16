var test = require('tape')
, Dispatcher = require('../../lib/quantum-stream-dispatcher').Dispatcher
, _ = require('lodash')
;

test('Dispatcher#unregister()', function (t) {
	t.test('unregister a callback', function (t) {
		var dispatcher = new Dispatcher()
		, id
		, i = 0
		;

		t.plan(1);

		id = dispatcher.register(function () {});

		dispatcher.unregister(id);

		_.forEach(dispatcher._stores, function (store, key) {
			i++;
		});
		
		t.equal(i, 0, '`i` should equal `0`.');
	});
	t.test('unregister the correct callback', function (t) {
		var dispatcher = new Dispatcher()
		, id = []
		, i = 0
		;

		t.plan(3);
		for (i; i < 3; ++i) {
			id[i] = dispatcher.register(function() {});
		}
		dispatcher.unregister(id[1]);

		i = 0;
		_.forEach(dispatcher._stores, function (store, key) {
			t.notEqual(id.indexOf(parseInt(key,10)), -1,
				'`id.indexOf(key)` should not equal `-1`.');
			i++;
		});
		t.equal(i, 2, '`i` should equal `2`.');
	});
	t.test('unregister multiple callbacks', function (t) {
		var dispatcher = new Dispatcher()
		, id = []
		, i = 0
		;

		t.plan(1);

		for (i; i < 3; i++) {
			id[i] = dispatcher.register(function () {});
		}
		for (i = 0; i < 3; i++) {
			dispatcher.unregister(id[i]);
		}
		i = 0;
		_.forEach(dispatcher._stores, function (store, key) {
			i++;
		});
		t.equal(i, 0, '`i` should equal `0`.');
	});
});
