var React = require('react');
var Helper = require('./_mixins');

var VoteForm = React.createClass({
	mixins: [Helper],
	componentWillMount : function(){
		//check if user is eligible to vote
		var canvote = false;
		if (window.isUserAuthed) {
			var username_voters = this.props.dataset.username_voters;
			var token = this._getCookie("token");
			//if voters not exist, allow to vote
			if (username_voters.indexOf(token) < 0) {
				canvote = true;
			}	
		}
		else {
			var ip_voters = this.props.dataset.ip_voters;
			var ip_address = this._getCookie("ip_address");
			//if voters not exist, allow to vote
			if (ip_voters.indexOf(ip_address) < 0) {
				canvote = true;
			}	
		}

		if (!canvote) {
			this.setState({pagestate : "voted"})
		}
	},
	_processVote : function(e) {
		e.preventDefault();
		this.props.onFormSubmit(this.refs.vote.value);
		this.setState({vote : this.refs.vote.value, pagestate : "voted"});
	},
	getInitialState : function() {
		return {
			vote : "",
			pagestate : "active"
		};
	},
	render : function() {		
		if (this.state.pagestate == "voted") {
			return (
				<form ref="voteform">
					<select disabled className="form-control voteDropdown" ref="vote">
					    {this.props.options}
					</select> 
					<button disabled type="submit" className="buttonVote pull-left">Vote</button>
					<div className="clearfix"></div>
					<div className="form-message">You've already voted</div>
				</form>
			);
		}

		return (
			<form ref="voteform" onSubmit={this._processVote}>
				<select className="form-control voteDropdown" ref="vote">
				    {this.props.options}
				</select> 
				<button type="submit" className="buttonVote pull-left">Vote</button>
				<div className="clearfix"></div>
				<div className="form-message">{this.props.message}</div>
			</form>
		);
	}
});

module.exports = VoteForm;
