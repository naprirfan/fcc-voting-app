var React = require('react');
var Helper = require('./_mixins');
var VoteForm = require('./_VoteForm');

var PollDetail = React.createClass({
	mixins : [Helper],
	_onFormSubmit : function(vote){
		console.log("data object = " + vote);
		var dataset = this.props.dataset;
		dataset.result[vote] += 1;

		$.ajax({
			url : "/vote",
			data : {
				vote : vote,
				_id : dataset._id
			},
			method :"PUT",
			success : function(data) {
				//todo : change dataset record in parent
			},
			error : function(jqxhr, textstatus) {
				self.setState({pagestate : "error", message : textstatus});
			}
		});

		this.setState({dataset : dataset});
	},
	getInitialState : function(){
		return {
			dataset : this.props.dataset
		}
	},
	_onDeleteLinkClicked : function(){
		PubSub.publish("delete_button_clicked", this.props.index);
	},
	render : function() {
		//initiate vars
		var data = this.state.dataset.result;
		var sum = 0;

		//get number of all votes
		for (var key in data) {
			sum += data[key];
		}

		//building vote result
		var graphs = [];
		var options = [];
		options.push(<option value="-">-- Select your vote --</option>);
		var idx = 0;
		for (var key in data) {
			//building options
			options.push(<option value={key}>{key.toUpperCase()}</option>);

			//styling graphic, calculate percentage
			var classname = "graphcolor" + idx;
			var percentage = 0;
			if (data[key] !== 0 && sum !== 0) {
				percentage = (data[key] * 100 / sum).toFixed(2);
			}
			//aesthetic
			var percentageWidth = percentage;
			if (percentageWidth < 1) {
				percentageWidth = 1;
			}

			var style = {
				width : percentageWidth + "%"
			}
			graphs.push(
				<div>
					<div style={style} className={classname} />
					<div className="legend">{key.toUpperCase() + " : " + percentage + "%"}</div>
				</div>
			);
			idx++;
		}

		//building share link
		var getUrl = window.location;
		var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
		var shareUrl = encodeURIComponent(baseUrl + "#detail#poll_id=" + this.props.index);
		var twitterLink = "https://twitter.com/intent/tweet?text=" + this.props.dataset.title + " Check out the vote result : "+ shareUrl;

		//build delete button if the user is the authors
		var deleteButton = [];
		if (this.props.dataset.author == this._getCookie("token")) {
			deleteButton.push(
				<a onClick={this._onDeleteLinkClicked} href="#" className="deletePollLink"><i className="fa fa-trash"></i> Click to delete this poll</a>
			);
		}

		var boundFormSubmit = this._onFormSubmit.bind(this);
		return (
			<div>
				<ol className="breadcrumb">
					<li><a onClick={this.props.homebutton} href="#home">Home</a></li>
					<li>{this.props.dataset.title}</li>
				</ol>
				{deleteButton}
				<br />
				<h1 className="title">{this.props.dataset.title}</h1>
				<div className="row">
					<div className="col-md-4">
						<VoteForm onFormSubmit={boundFormSubmit} index={this.props.index} options={options} dataset={this.props.dataset} />
						<br />
						<a target="_blank" href={twitterLink} className="buttonShare"><i className="fa fa-twitter"></i> Tweet this to your followers</a>
						<br /><br />
						{this.props.dataset.description}
					</div>
					<div className="col-md-8"><h3>Poll Result ({sum} votes): </h3>{graphs}</div>
				</div>
			</div>
		);
	}
});

module.exports = PollDetail;