/** @jsx React.DOM */

var React = require('react');

var About = React.createClass({
  render: function () {
    return (
      <div className="About">
        <p>Find out more about `quantum-flux` here:</p>
        <a href="https://github.com/sterpe/quantum-flux">visit quantum-flux on github</a>
      </div>
    );
  }
});

module.exports = About;
