/*
 * 
 * q-flux-demo.js */

var React = require('react'),
  router = require('./q-flux-router.js'),
  window = require('./window.js'),
  Page = require('./jsx2js/page.js'),
  Home = require('./jsx2js/home.js'),
  About = require('./jsx2js/about.js');

window.React = window.React || React;
window.router = window.router || router;

router.addRoute('/', Home);
router.addRoute('/about', About);
