
var React = require('react'),
  flux = require('./q-flux-instance.js'),
  routeDataStore = require('./q-flux-routeDataStore.js'),
  window = require('./window.js'),
  _ = require('lodash');


function Router(options) {
  "use strict";
  this.dataStore = this.dataStore || options.dataStore;
  if (!this.dataStore) {
    throw new Error("No dataStore specified for the Router!");
  }
  this._routes = this._routes || {};
}

_.extend(Router.prototype, {

  addRoute: function (route, view) {
    "use strict";

    Router.prototype.constructor.call(this);
    //Complex route matching/storing logic goes here.
    this._routes[route] = view;
  }

});

var router = new Router({
  dataStore: routeDataStore,
  viewComponent: null
});

//the dataStore will only be exposed via the router.dataStore
//this guarantees that the router gets first listenership of all payloads.
router.dataStore.addListener('change', _.bind(function (newHash, oldHash) {
  "use strict";
  var node;
  //TODO: get the component.
  
  if (!newHash) {
    window.location.hash = '/';
  }
  if (newHash.indexOf('#') === 0) {
    newHash = newHash.slice(1);
  }
  console.log(arguments);
  console.log(this._routes);
  node = document.getElementById('view');
  console.log(node);
  this.viewComponent = this._routes[newHash] || this.viewComponent;
  React.renderComponent(
    this.viewComponent && this.viewComponent(null),
    node
  );
}, router));

window.addEventListener('hashchange', function (e) {
  "use strict";
  var regex = /.*\#(.*)/;

  flux.dispatch({
    actionType: 'window.hashchange',
    data: {
      newHash: e.newURL.replace(regex, '$1'),
      oldHash: e.oldURL.replace(regex, '$1')
    }
  });
});

window.addEventListener('load', function () {
  "use strict";

  var regex = /.*\#(.*)/;

  flux.dispatch({
    actionType: 'window.hashchange',
    data: {
      newHash: window.location.hash,
      oldHash: null
    }
  });
});

module.exports = router;
