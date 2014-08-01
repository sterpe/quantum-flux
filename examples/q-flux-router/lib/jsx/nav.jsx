/** @jsx React.DOM */

var React = require('react'),
  _ = require('lodash');

var Navbar = React.createClass({
  render: function () {
    var navOptions = _.map(this.props.data, function (option) {
      return (
        <li>
          <a href={option.href}>{option.name}</a>
        </li>
      );
    });

    return (
      <div className="nav">
        <ul>
          {navOptions}
        </ul>
      </div>
    );
  }
});

module.exports = Navbar;
