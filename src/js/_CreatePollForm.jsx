var React = require('react');

var CreatePollForm = React.createClass({
	_sanitizeInput : function() {
		var arr = this.formdata.poll_options.split(",");
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].trim() == "") {
				continue;
			}
			arr[i] = arr[i].trim();
		}
		return {
			title : this.formdata.title.trim(),
			description : this.formdata.description.trim(),
			poll_options : arr.join(",")
		};
	},
	_validateForm : function(){
		if (this.formdata.title == "" || this.formdata.description == "" || this.formdata.poll_options == "") {
			return false;
		}
		var arr = this.formdata.poll_options.split(",");
		if (arr.length >= 10) {
			return false;
		}
		return true;
	},
	_processForm : function(e){
		e.preventDefault();
		this.formdata = {
			title : this.refs.title.value,
			description : this.refs.description.value,
			poll_options : this.refs.poll_options.value
		};

		if (this._validateForm()) {
			this.formdata = this._sanitizeInput();
			var self = this;
			PubSub.publish("request_loading_page");
			$.ajax({
				method: "POST",
				url: "/createpoll",
				data : self.formdata,
				success : function(result){
					PubSub.publish("on_createpoll_succeed");	
				},
				error : function(jqxhr, textstatus){
					PubSub.publish("request_error_page");
				}
			});
		}
		else {
			alert("form is not valid. Please fill all fields, and make sure poll_options item amount is fewer than 10");
		}

	},
	render : function() {
		return (
			<form id="createpoll_form" ref="createpoll_form" onSubmit={this._processForm}>
				<h2>Create New Poll</h2>
				<div className="input-group">
					<label>Poll title</label>
			  		<input name="title" ref="title" type="text" className="form-control" placeholder="E.g : Democrat or Republican?" />
				</div>
				<div className="input-group">
					<label>Description</label>
			  		<input name="description" ref="description" type="text" className="form-control" placeholder="Explain why anyone should vote" />
				</div>
				<div className="input-group">
					<label>Poll Options (comma separated, maximum 10 items)</label>
			  		<input name="poll_options" ref="poll_options" type="text" className="form-control" placeholder="E.g : Democrat, Republican, Both" />
				</div>
				<br />
				<button type="submit" className="btn btn-primary">Submit</button>
			</form>
		);
	}
});

module.exports = CreatePollForm;