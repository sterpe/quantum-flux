/*
 * 
 * sample.js */


var X = require('x'),
  Y = require('y'),
  Z = require('z'),
  _ = require('lodash');

function Foo() {
}

_.extend(Foo.prototype, X.prototype, Y.prototype, Z.prototype) {
  //Foo specific prototype stuff here.
});

//Okay so now we have Foo, which has all of the methods and properties,
//of X, Y, Z....however many of these are private fields that we don't 
//want to expose to users of Foo.
//
//So we do this...


module.exports = function FooFactory() {
  var foo = new Foo();
  
  return {
    bar: _.bind(foo.bar, foo);
    baz: _.bind(foo.baz, foo);
    bim: _.bind(foo.bim, foo);
    bop: _.bind(foo.bop, foo);
  }
};


//So now we export a Foo Proxy object that only exposes
//Foo.bar, Foo.baz, Foo.bim, Foo.bop
//
//So this is somewhat complicated to document using jsDocs because 
//X.bar, Y.baz, Z.bop are not really membersOf `foo` internally, even
//though that's what we want externally. 
  


