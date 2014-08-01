/** @jsx React.DOM */

var React = require('react'),
  window = require('./../window.js'),
  document = window.document,
  Navbar = require('./nav.js'),
  View = require('./view.js');

var navigationOptions = [
  {
    href: "#/",
    name: "home"
  },
  {
    href: "#/about",
    name: "about"
  }
];

var Page = React.createClass({
  render: function () {
    return (
      <div className="page" >
        <h1>quantum-flux for React</h1>
        <Navbar data={navigationOptions} />
        <View />
      </div>
    );
  }
});

React.renderComponent(
  <Page />,
  document.getElementById('content')
);

