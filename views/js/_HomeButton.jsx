var React = require('react');

var HomeButton = React.createClass({
	render : function() {
		return (
			<a href="#home" onClick={this._onClick}>Voters</a>
		);
	},
	_onClick : function() {
		PubSub.publish('on_homebutton_click');
	}
});

module.exports = HomeButton;