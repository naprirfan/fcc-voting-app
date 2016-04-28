var React = require('react');

var HomeButton = require('./_HomeButton');
var LoginButton = require('./_LoginButton');
var App = require('./_App');

ReactDOM.render(<HomeButton />, document.getElementById("navbar-brand"));
ReactDOM.render(<LoginButton />, document.getElementById("login"));
ReactDOM.render(<App />, document.getElementById("root"));