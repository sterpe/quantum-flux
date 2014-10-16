var test = require('tape')
, Dispatcher = require('../../lib/quantum-stream-dispatcher').Dispatcher
, _ = require('lodash')
;

test('Dispatcher#isDispatching()', function (t) {
	t.test('when dispatcher is idle returns false', function (t) {
		var dispatcher = new Dispatcher()
		, dispatch = {}
		;
		t.plan(1);
		
		dispatcher.register(function () {});
		
		t.notOk(dispatcher.isDispatching());
	});
	t.test('when dispatching return true', function (t) {
		var dispatcher = new Dispatcher()
		, dispatch = {}
		;
	
		t.plan(1);

		dispatcher.register(function () {});

		dispatcher.dispatch(dispatch);

		t.ok(dispatcher.isDispatching());
	});
	t.test('when dispatch is over returns false', function (t) {
		var dispatcher = new Dispatcher()
		, dispatch = {}
		;

		t.plan(1);

		dispatcher.register(function () {});

		dispatcher.dispatch(dispatch).onStoresUpdated
			.then(function () {
				t.notOk(dispatcher.isDispatching());
			});
	});
});
