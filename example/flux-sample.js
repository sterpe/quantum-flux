/*
 * 
 * flux-sample.js */

var _ = require('lodash'),
  AppDispatcher = require('./applicationDispatcher.js'),
  flux = require('./../flux.js'),
  store_A,
  store_B;

store_A = new flux.Store({
  update: function (e) {
    "use strict";

    var action = e.action;

    switch (action.actionType) {
    case "foo":
      console.log('store_A foo');
      break;
    case "bar":
      AppDispatcher.waitFor(store_A.dispatchIndex, _.bind(function (e) {
        console.log('store_A bar');
        this.actionType = action.actionType;
        this.emit('change');
      }, this), function (r) {
        console.log(r);
      });
      return;
    case "baz":
      console.log('store_A baz');
      break;
    default:
      return;
    }
    this.actionType = action.actionType;
    this.emit('change');
  }
});

store_B = new flux.Store({

  update: function (e) {
    "use strict";

    var action = e.action;

    switch (action.actionType) {
    case "foo":
      console.log('store_B foo');
      break;
    case "bar":
      console.log('store_B bar');
      break;
    default:
      return false;
    }
    this.actionType = action.actionType;
    this.emit('change');
  }
});

store_A.dispatchIndex = AppDispatcher.register(_.bind(store_A.update, store_A));

store_B.dispatchIndex = AppDispatcher.register(_.bind(store_B.update, store_B));

store_B.addListener('change', function () {
  "use strict";
  console.log('change B:', store_B.actionType);
  if (store_B.actionType === "bar") {
    AppDispatcher.dispatch({
      action: {
        actionType: "baz"
      },
      error: null
    });
  }
  if (store_B.actionType === "foo") {
    AppDispatcher.dispatchImmediate({
      action: {
        actionType: "baz"
      },
      error: null
    });
  }
});

store_A.addListener('change', function () {
  "use strict";
  console.log('change A:', store_A.actionType);
});


AppDispatcher.dispatch({
  action: {
    actionType: "foo"
  },
  error: null
});

AppDispatcher.dispatch({
  action: {
    actionType: "bar"
  },
  error: null
});

