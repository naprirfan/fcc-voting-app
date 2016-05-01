var React = require('react');

var VoteForm = React.createClass({
	_processVote : function(e) {
		e.preventDefault();
		this.props.onFormSubmit(this.refs.vote.value);
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
