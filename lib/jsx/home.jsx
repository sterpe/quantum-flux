/** @jsx React.DOM */

var React = require('react');

var Home = React.createClass({
  render: function () {
    return (
      <div className="home">
        <p>Welcome to the `quantum-flux` home page </p>
        <p>This spartan page demonstrates using React and quantum-flux to build a url router.</p>
        <p>Checkout the about page for the links</p>
      </div>
    );
  }
});

module.exports = Home;
