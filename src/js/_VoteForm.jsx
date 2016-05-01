var React = require('react');

var VoteForm = React.createClass({
	_processVote : function(e) {
		e.preventDefault();
		if (this.refs.new_option !== undefined && this.refs.new_option.value != "") {
			this.props.onFormSubmit({new_option : this.refs.new_option.value});
		}
		else {
			this.props.onFormSubmit(this.refs.vote.value);	
		}

		
	},
	render : function() {		
		//if cannot vote
		if (!this.props.canvote) {
			return (
				<form ref="voteform">
					<div className="form-message">You've already voted</div>
				</form>
			);
		}

		//options
		var new_option = [];
		if (window.isUserAuthed) {
			new_option.push(
				<div className="input-group">
					<br />
					<input className="form-control" type="text" name="new_option" ref="new_option" placeholder="Or, type your own opinion" />
				</div>
			);	
		}
		

		return (
			<form ref="voteform" onSubmit={this._processVote}>
				<select className="form-control voteDropdown" ref="vote">
				    {this.props.options}
				</select> 
				<button type="submit" className="buttonVote pull-left">Vote</button>
				<div className="clearfix"></div>
				{new_option}
				<div className="form-message">{this.props.message}</div>
			</form>
		);
	}
});

module.exports = VoteForm;
