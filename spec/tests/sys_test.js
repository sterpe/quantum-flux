/*
 * 
 * test/sys/nextTick_test.js */

/*jslint sloppy:true */
/*global describe, it */

var sys = require('../../lib/sys.js');

describe('Sys', function () {

  describe('(global) window', function () {
    it('should exist for this test', function () {
      (typeof window).should.not.equal("undefined");
    });
    describe('(global) window#postMessage()', function () {
      it('should be a function for this to work', function () {
        window.postMessage.should.be.a.Function;
      });
    });
  });

  describe('#nextTick()', function () {
    it('should execute a function after a delay', function (done) {
      var flag1 = false;
      window.addEventListener('message', function (e) {
        e.source.should.equal(window);
        e.origin.should.equal(window.location.origin);
        e.data.indexOf('@sys-next-tick').should.not.equal(-1);
      });
      sys.nextTick(function () {
        flag.should.be.true;
        done();
      });
      flag = true;
    });
  });
});
