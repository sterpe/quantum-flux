/*
 * 
 * dispatch_order.js */

//This file gives a sense
var quantum = require('./../lib/flux.js'),
  flux = new quantum.FluxInstance(),
  Store = flux.Store,
  Zero,
  A,
  B,
  C,
  D,
  E;
Zero = new Store();
A = new Store({ name: "A"});
B = new Store({ name: "B"});
C = new Store({ name: "C"});
D = new Store({ name: "D"});
E = new Store({ name: "E"});

Zero.register(function (payload) {
  console.log('\n', 'NEXT DISPATCH PHASE BEGINS -- PAYLOAD IS:', payload, '\n');
});

var f = function (name) {
  "use strict";
  return function (x) {
    console.log('Listener of ' + name + ' reporting.  Payload was:  ', x);
    if (name === 'E') {
      console.log('\n');
    }
  };
};

A.register(function (x) {
  "use strict";
  var self = this;

  this.waitFor(B, function (x) {
    console.log('\n', 'A waited for B');
    if (x === 1) {
      flux.dispatch(8);
      console.log('\n', 'The payload was "1" so B dispatched payload "8"');
    }
    self.emit('change', x);
  });
});

A.addListener('change', f('A'));

B.register(function (x) {
  "use strict";
  var self = this;
  this.waitFor([D], function (x) {
    console.log('\n', 'B waited for D');
    if (x === 1) {
      flux.dispatch(7);
      console.log('\n',"The payload was '1' so B dispatched the payload '7'");
    }
    self.emit('change', x);
  });
});

B.addListener('change', f('B'));

C.register(function (x) {
  "use strict";
  if (x === 3) {
    flux.dispatch(6);
    console.log('\n', 'The payload was "3" so C dispatched the payload "6"');
  }
  this.emit('change', x);
});

C.addListener('change', f('C'));

D.register(function (x) {
  "use strict";
  if (x === 1) {
    flux.dispatch(9);
    console.log('\n', "The payload was \"1\" so D dispatched the payload \"9\"");
  }
  this.emit('change', x);
});

D.addListener('change', f('D'));

E.register(function (x) {
  "use strict";
  var self = this;
  this.waitFor([D, B, C], function (x) {
    console.log('\n', 'E waited for D,B,C', '\n');
    self.emit('change', x);
  });
});

E.addListener('change', f('E'));

console.log('\n');

for (var i = 1; i < 6; ++i) {
  console.log('Dispatching payload: ', i);
  flux.dispatch(i);
}
console.log('\n');

