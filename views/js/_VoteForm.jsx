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
			this.setState({pagestate : "voted", message : "You've already voted (Either by IP address or by username)"})
		}
	},
	_processVote : function(e) {
		e.preventDefault();

		var self = this;
		this.setState({pagestate : "loading"});

		//1. Take data from form
		var formdata = {
			_id : this.props.dataset._id,
			vote : this.refs.vote.value
		};

		$.ajax({
			url : "/vote",
			data : formdata,
			method :"PUT",
			success : function(data) {
				//TODO : implement update UI
				var newrecord = JSON.parse(data);
				var result = {
					index : self.props.index,
					data : JSON.stringify(newrecord.value)
				}
				
			},
			error : function(jqxhr, textstatus) {
				self.setState({pagestate : "error", message : textstatus});
			}
		});
	},
	getInitialState : function() {
		return {
			pagestate : "active",
			message : ""
		};
	},
	render : function() {
		if (this.state.pagestate == "active") {
			return (
				<form ref="voteform" onSubmit={this._processVote}>
					<select className="form-control voteDropdown" ref="vote">
					    {this.props.options}
					</select> 
					<button type="submit" className="buttonVote pull-left">Vote</button>
					<div className="clearfix"></div>
				</form>
			)	
		}
		else if (this.state.pagestate == "loading") {
			return (
				<form ref="voteform" onSubmit={this._processVote}>
					<select disabled className="form-control voteDropdown" ref="vote">
					    {this.props.options}
					</select> 
					<button disabled type="submit" className="buttonVote pull-left">Vote</button>
					<div className="loading">Loading ...</div>
					<div className="clearfix"></div>
				</form>
			)
		}
		else if (this.state.pagestate == "error") {
			return (
				<form ref="voteform" onSubmit={this._processVote}>
					<select className="form-control voteDropdown" ref="vote">
					    {this.props.options}
					</select> 
					<button type="submit" className="buttonVote pull-left">Vote</button>
					<div className="clearfix"></div>
					<div className="form-message">{this.state.message}</div>
				</form>
			);			
		}

		//State : dropdown and button are disabled, message shown
		//Statename : voted
		return (
			<form ref="voteform" onSubmit={this._processVote}>
				<select disabled className="form-control voteDropdown" ref="vote">
				    {this.props.options}
				</select> 
				<button disabled type="submit" className="buttonVote pull-left">Vote</button>
				<div className="clearfix"></div>
				<div className="form-message">{this.state.message}</div>
			</form>
		);

		
	}
});

module.exports = VoteForm;
