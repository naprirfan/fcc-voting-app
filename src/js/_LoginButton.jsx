var React = require('react');
var Helper = require('./_mixins');

var LoginButton = React.createClass({
	mixins : [Helper],
	_onCreatepollClick : function(){
		PubSub.publish("on_create_pollbutton_click");
	},
	render : function() {
		if (this._getCookie("token") !== null) {
			window.isUserAuthed = true;
			return (
				<div className="right-menu">
					<a href="/signout" className="buttonLogin">
						Sign Out
					</a>
					<a onClick={this._onCreatepollClick} href="#createpoll" className="createPollButton">
						<i className="fa fa-plus fa-2x"></i>
					</a>
				</div>
			);
		}
		else {
			window.isUserAuthed = false;
			return (
				<a href="https://github.com/login/oauth/authorize?client_id=c73864bb2fa3040f875e" className="buttonLogin">
					<i className="fa fa-github"></i> Sign in with Github
				</a>
			);
		}
	}
});

module.exports = LoginButton;