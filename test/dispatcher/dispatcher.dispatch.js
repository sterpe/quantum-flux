var test = require('tape')
, Dispatcher = require('../../lib/quantum-stream-dispatcher').Dispatcher
, _ = require('lodash');

test('Dispatcher#dispatch()', function (t) {
	t.test('single dispatch to single store', function (t) {
		var dispatcher = new Dispatcher()
		, dispatch = {}
		;
		t.plan(1);
		dispatcher.register(function (payload) {
			t.strictEqual(payload, dispatch, '`payload` ' +
				'should strictEqual `dispatch`.');
		});

		dispatcher.dispatch(dispatch);
	});
	t.test('single dispatch to multiple stores', function (t) {
		var dispatcher = new Dispatcher()
		, dispatch = {}
		, i = 0;
		;
		t.plan(3);
		for (i; i < 3; ++i) {
			dispatcher.register(function (payload) {
				t.strictEqual(payload, dispatch, 
					'`payload` should strictEqual ' +
						'`dispatch`.');
			});
		}
		
		dispatcher.dispatch(dispatch);
	});
	t.test('can\'t dispatch during a dispatch', function (t) {
		var dispatcher = new Dispatcher() 
		, dispatch = {}
		, i = 0
		;
		t.plan(1);

		dispatcher.register(function () {});

		dispatcher.dispatch(dispatch);

		try {
			dispatcher.dispatch(dispatch);
			t.fail();
		} catch (e) {
			t.pass();
		}
	});
	t.test('ok to dispatch after a dispatch completes', function (t) {
		var dispatcher = new Dispatcher()
		, dispatch = {}
		, i = 0
		;

		t.plan(1);

		dispatcher.register(function () {});

		dispatcher.dispatch(dispatch).onStoresUpdated
			.then(function () {
				try {
					dispatcher.dispatch({});
					t.pass();
				} catch (e) {
					t.fail();
				}
			});
	});

});
