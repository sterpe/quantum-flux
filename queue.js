/*
 * 
 * queue.js */

var Flux = require('./lib/flux.js').Flux,
  flux = new Flux(),
  Store = flux.Store,
  A, B, C, D, E;

A = new Store({ name: "A"});
B = new Store({ name: "B"});
C = new Store({ name: "C"});
D = new Store({ name: "D"});
E = new Store({ name: "E"});

var f = function (name) {
  "use strict";
  return function (x) {
    console.log(name, x);
  };
};

A.register(function (x) {
  "use strict";
  var self = this;

  this.waitFor(B, function (x) {
    self.emit('change', x);
    if (x === 1) {
      flux.dispatch(8);
    }
  });
});

A.addListener('change', f('A'));

B.register(function (x) {
  "use strict";
  var self = this;
  this.waitFor([D], function (x) {
    self.emit('change', x);
    if (x === 1) {
      flux.dispatch(7);
    }
  });
});

B.addListener('change', f('B'));

C.register(function (x) {
  "use strict";
  this.emit('change', x);
  if (x === 3) {
    flux.dispatch(6);
  }
});

C.addListener('change', f('C'));

D.register(function (x) {
  "use strict";
  this.emit('change', x);
  if (x === 1) {
    flux.dispatch(9);
  }
});

D.addListener('change', f('D'));

E.register(function (x) {
  "use strict";
  var self = this;
  this.waitFor([D, B, C], function (x) {
    self.emit('change', x);
  });
});

E.addListener('change', f('E'));

flux.dispatch(1);
flux.dispatch(2);
flux.dispatch(3);
flux.dispatch(4);
flux.dispatch(5);

