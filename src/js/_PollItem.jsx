var React = require('react');
var Helper = require("./_mixins_helper");

var PollItem = React.createClass({
	mixins : [Helper],
	_getExcerpt : function(str, separator, num_of_word) {
	    separator = separator || " ";
	    var arr = str.split(separator);
	    if (arr.length < num_of_word) {
	    	return str;
	    }
	    var result = "";
	    for (var i = 0; i < num_of_word; i++) {
	      if (arr[i] !== undefined) {
	        result += (arr[i] + separator);
	      }
	    }
	    return result + "...";
  	},
  	_onDelete : function() {
  		PubSub.publish("delete_button_clicked", this.props.index);
  	},
	render : function() {
		var deleteButton = [];
		if (this.props.author == this._getCookie("token")) {
			deleteButton.push(<a onClick={this._onDelete} href="#" className="pull-right"><i className="fa fa-trash"></i></a>);
		}
		return (
    		<div className="panel panel-default">
		        <div className="panel-heading">
		          <h3 className="panel-title">
		            {this.props.title}
		            {deleteButton}
		          </h3>
		        </div>
		        <div className="panel-body">
		          <div className="row">
		            <div className="col-xs-12">
						{this._getExcerpt(this.props.description, " ", 10)}
						<br />
	              		<a onClick={this.props.see_polling_detail} href={"#detail#poll_id=" + this.props.index}>Click to see detail <i className="fa fa-chevron-circle-right"></i></a>
		            </div>
		          </div>
		        </div>
	      	</div>
	    );
	}
});

module.exports = PollItem;