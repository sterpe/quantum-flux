var test = require('tape')
, Dispatcher = require('../../lib/quantum-stream-dispatcher').Dispatcher
, _ = require('lodash')
;

test('Dispatcher#register()', function (t) {
	t.test('register a callback', function (t) {
		var dispatcher = new Dispatcher()
		, i = 0
		;

		t.plan(1);

		dispatcher.register(function (payload) {
		});

		_.forEach(dispatcher._stores, function (store, key) {
			i++;
		});

		t.equal(i, 1, '`i` should equal `1`');
	});
	t.test('register multiple callbacks', function (t) {
		var dispatcher = new Dispatcher()
		, i = 0
		;

		t.plan(1);

		for (i = 0; i < 3; i++) {
			dispatcher.register(function () {});
		}

		i = 0;

		_.forEach(dispatcher._stores, function (store, key) {
			i++;
		});

		t.equal(i, 3, '`i` should equal `3`');
	});
});
