var test = require('tape')
, through2 = require('through2')
, Dispatcher = require('../lib/quantum-stream-dispatcher').Dispatcher
;

/*
test('Dispatcher test', function (t) {
	t.plan(1);
	
	var dispatcher = new Dispatcher();
	var endpoint = through2.obj(function (payload, enc, done) {
		t.equal(payload, dispatched);
		done();
	});

	var dispatched = {
		actionType: 'foo',
	};

	dispatcher.dispatch(dispatched);
	dispatcher.pipe(endpoint);
//	dispatcher.dispatch(dispatched);
});
*/
test('Dispatcher#register()', function (t) {
	t.test('register a store', function (t) {
		var dispatcher = new Dispatcher()
		;
		dispatcher.register(function (payload) {
			t.equal(payload, 'foo');
			t.end();
		});
		dispatcher.dispatch('foo');
	});
	t.test('register mulitple stores', function (t) {
		var dispatcher = new Dispatcher()
		;

		t.plan(2);

		dispatcher.register(function (payload) {
			t.equal(payload, 'foo');
		});
		dispatcher.register(function (payload) {
			t.equal(payload, 'foo');
		});
		dispatcher.dispatch('foo');
	});
});
