/*
 * 
 * events_test.js */

/*jslint sloppy:true */
/*global describe, it, before, beforeEach*/

var EventEmitter = require('./../../lib/events.js').EventEmitter,
  _ = require('lodash'),
  mut,
  bar = function () {},
  baz = function () {};

function MUT() {}

_.extend(MUT.prototype, EventEmitter.prototype);

describe('EventEmitter', function () {
  beforeEach(function () {
    mut = new MUT();
  });
  describe('#addListener', function () {
    it('should add a listener', function () {
      mut.addListener('foo', bar);
      mut.__eventEmitter.events['foo'][0].should.equal(bar);
      mut.__eventEmitter.events['foo'][0].should.be.a.Function;
      mut.__eventEmitter.events['foo'].length.should.equal(1);
    });

    it('should not register the same listener twice for the same event',
      function () {
        mut.addListener('foo', bar);
        mut.addListener('foo', bar);
        mut.__eventEmitter.events['foo'][0].should.equal(bar);
        mut.__eventEmitter.events['foo'][0].should.be.a.Function;
        mut.__eventEmitter.events['foo'].length.should.equal(1);
      });

    it('should register the same listener for multiple events',
      function () {
        mut.addListener('foo', bar);
        mut.addListener('bar', bar);
        mut.__eventEmitter.events['foo'][0].should.equal(bar);
        mut.__eventEmitter.events['foo'].length.should.equal(1);
        mut.__eventEmitter.events['bar'][0].should.equal(bar);
        mut.__eventEmitter.events['bar'].length.should.equal(1);
    });
        
    it('should add multiple listeners to the same event', function () {
      mut.addListener('foo', bar);
      mut.addListener('foo', baz);
      mut.__eventEmitter.events['foo'][0].should.equal.bar;
      mut.__eventEmitter.events['foo'][0].should.be.a.Function;
      mut.__eventEmitter.events['foo'][1].should.equal.baz;
      mut.__eventEmitter.events['foo'][1].should.be.a.Function;
      mut.__eventEmitter.events['foo'].length.should.equal(2);
    });

    it('should add multiple listeners to different events', function () {
      mut.addListener('foo1', bar);
      mut.addListener('foo2', baz);
      mut.__eventEmitter.events['foo1'][0].should.equal.bar;
      mut.__eventEmitter.events['foo1'][0].should.be.a.Function;
      mut.__eventEmitter.events['foo1'].length.should.equal(1);
      mut.__eventEmitter.events['foo2'][0].should.equal.baz;
      mut.__eventEmitter.events['foo2'][0].should.be.a.Function;
      mut.__eventEmitter.events['foo1'].length.should.equal(1);
    });

    it('should add a listener during an event to fire on the next event',
      function (done) {
        var flags = [],
          thrice = 0;
        function a() {
          flags.push('a');
          mut.addListener('foo', b);
        }
        function b() {
          flags.push('b');
        }
        function c() {
          if (++thrice === 3) {
            flags.should.eql(['a', 'a', 'b', 'a']);
            done();
          }
        }
        mut.addListener('foo', a);
        mut.addListener('foo', c);
        mut.emit('foo');
        mut.emit('foo');
        mut.emit('foo');
      });
    it('should have an alias `#on()`', function () {
      mut.on.should.equal(mut.addListener);
    });

    it('should have an alias `#addEventListener()`', function () {
      mut.addEventListener.should.equal(mut.addListener);
    });
  });

  describe('#removeListener()', function () {
    it('should remove a specific listener', function () {
      mut.addListener('foo', bar);
      mut.removeListener('foo', bar);
      mut.__eventEmitter.events['foo'].length.should.equal(0);
    });

    it('should remove all listeners for an event', function () {
      mut.addListener('foo', bar);
      mut.addListener('foo', baz);
      mut.removeListener('foo');
      mut.__eventEmitter.events['foo'].length.should.equal(0);
    });

    it('should remove a listener during an event, effectively cancelling that event for that listener', function (done) {
      var flags = [];
      function a() {
        flags.push('a');
        mut.removeListener('foo', b);
      }
      function b() {
        flags.push('b');
      }
      function c() {
        flags.should.eql(['a']);
        done();
      }
      mut.addListener('foo', a);
      mut.addListener('foo', b);
      mut.addListener('foo', c);

      mut.emit('foo');
    });

    it('should have an alias `#off()`', function () {
      mut.off.should.equal(mut.removeListener);
    });

    it('should have an alias `#removeEventListener()`', function () {
      mut.removeEventListener.should.equal(mut.removeListener);
    });
  });
  describe('#removeAllListeners()', function () {

    it('should remove all listeners', function () {
      mut.addListener('foo1', bar);
      mut.addListener('foo2', baz);
      mut.removeAllListeners();
      mut.__eventEmitter.events['foo1'].length.should.equal(0);
      mut.__eventEmitter.events['foo2'].length.should.equal(0);
    });
  });

  describe('#listeners()', function () {
    it('should return an array with the listeners for an event',
      function () {
        var listeners = [bar, baz];
        mut.addListener('foo', bar);
        mut.addListener('foo', baz);

        _.each(mut.listeners('foo'), function (_, i, array) {
          array[i].should.equal(listeners[i]);
        });
        mut.__eventEmitter.events['foo'].length.should.equal(2);
      });
  });


  describe('#setMaxListeners()', function () {
    it('should set the maximum # of listeners to the object', function () {
      mut.setMaxListeners(20);
      mut.__eventEmitter.maxListeners.should.equal(20);
    });

    it('should `console.warn` if there are too many listeners', 
      function () {
        var _console = {
          warn: function () {
            true.should.be.ok;
          }
        };
        //_console = GLOBAL.console;
        var con = window.console;
        window.console = _console;
        mut.setMaxListeners(1);
        mut.addEventListener('foo', bar);
        window.console = con;
      });
    it('should not warn if `maxListeners` is set to `0`', function () {
      var flag = true;
      var _console = {
        warn: function () {
          flag = false;
        }
      };

      var con = window.console;
      window.console = _console;
      mut.setMaxListeners(0);
      mut.addEventListener('foo', bar);
      mut.addEventListener('foo', baz);
      mut.addEventListener('bar', bar);
      mut.addEventListener('bar', baz);
      window.console = con;
      flag.should.be.ok;
    });
  });
  describe('#emit()', function () {
    it('should call registered listeners for an event in order with arguments', 
      function (done) {
        var flags = [];
        mut.addEventListener('foo', function (x, y) {
          flags.push('a');
          flags.push(x);
          flags.push(y);
        });
        mut.addListener('foo', function (x, y) {
          flags.push('b');
          flags.push(x);
          flags.push(y);
        });
        mut.addListener('foo', function (x, y) {
          x.should.equal('arg1');
          y.should.equal('arg2');
          flags.should.eql(['a', x, y,'b', x, y]);
          done();
        });
        mut.emit('foo', 'arg1', 'arg2');
      });
  });
  describe('#once()', function () {
    it('should register a function that is only called once.',
      function (done) {
        var flags = [],
          twice = 0;
        mut.once('foo', function (x, y) {
          flags.push('a');
          flags.push(x);
          flags.push(y);
        });
        mut.addListener('foo', function (x, y) {
          if(++twice === 2) {
            flags.should.eql(['a', 'arg1', 'arg2']);
            done();
          }
        });
        mut.emit('foo', 'arg1', 'arg2');
        mut.emit('foo', 'bar', 'baz');
      });
  });
    
  describe('<static> #listenerCount()', function () {
    it('should return the # of listeners an emitter has for an event',
      function () {
        mut.addListener('foo', bar);
        mut.addListener('foo', baz);

        EventEmitter.listenerCount(mut, 'foo').should.equal(2);
      });
  });
});

