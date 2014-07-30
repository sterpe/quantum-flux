/*
 * 
 * test/sys/nextTick_test.js */

/*jslint sloppy:true */
/*global describe, it */

var sys = require('../../lib/sys.js');

sys = {
  nextTick: new sys.SystemNextTick()
};

describe('SystemNextTick', function () {

  describe('window', function () {
    it('should exist for this test', function () {
      (typeof window).should.not.equal("undefined");
    });
  });
  describe('window#postMessage', function () {
    it('should be a function for this to work', function () {
      window.postMessage.should.be.a.Function;
    });
  });

  describe('the function returned by new SystemNextTick()', function () {
    it('should execute a function after a delay', function (done) {
      var flag1 = false;
      window.addEventListener('message', function (e) {
        e.source.should.equal(window);
        e.origin.should.equal(window.location.origin);
        e.data.indexOf('@flux').should.not.equal(-1);
      });
      sys.nextTick(function () {
        flag.should.be.true;
        done();
      });
      flag = true;
    });
    /*
    it('should not interfere with another instance', function (done) {
      var process = {
        nextTick: new require('../../lib/sys.js').SystemNextTick()
      };

      var flags = [];

      sys.nextTick(function () {
        flags.push('x');
      });

      process.nextTick(function () {
        flags.length.should.equal(1);
        done();
      });
    });
    it('should not be fired by non-related window message traffic', function (done) {
      var flag = false;
      sys.nextTick(function () {
        flag = true;
      });
      setTimeout(function () {
        flag = false
        window.postMessage('hello, world.', "*");
        setTimeout(function () {
          flag.should.be.false;
          done();
        }, 0);
      }, 0);
    });
    it('should support recursive nextTicking', function (done) {
      var flags = [];
      sys.nextTick(function () {
        flags.push(1);
        sys.nextTick(function () {
          flags.push(2);
          sys.nextTick(function () {
            flags.push(3);
            [1, 2, 3].should.eql(flags);
            done();
          });
        });
      });
    });
    */
  });
});
