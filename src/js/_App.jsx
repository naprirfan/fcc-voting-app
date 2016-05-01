var React = require('react');
var PollItem = require("./_PollItem");
var PollDetail = require("./_PollDetail");
var CreatePollForm = require("./_CreatePollForm");
var Helper = require("./_mixins_helper");
var Routes = require("./_mixins_route");

var App = React.createClass({
	mixins : [Helper, Routes],
	getInitialState : function() {
		return {
			dataset : [],
			currentPage : "",
			selectedItem : -1
		}
	},
	_getPollingList : function(callback, shouldGetFreshdata) {
		var dataset = JSON.parse(localStorage.getItem("dataset"));
		//if there's item in local storage,
		//and if shouldn't get fresh data,
		//and if not the very beginning request, 
		//then use dataset from localStorage
		if (dataset.length > 0 && !shouldGetFreshdata && this.state.dataset.length > 0) {
			callback(dataset);
		}
		else {
			var self = this;
			$.ajax({
				method: "GET",
				url : "/findAllPoll",
				success: function(dataset){
					localStorage.setItem("dataset", dataset);
					callback(JSON.parse(dataset));
				},
				error: function(jqxhr, textstatus) {
					self.setState({currentPage: "error"});
				}
			});	
		}
	},
	componentWillMount : function() {
		var self = this;
		
		/*--------------------------------
			subscribe to outside events
		//--------------------------------*/
		this.pubsub_token = PubSub.subscribe("on_homebutton_click", function(){
			this._getPollingList(function(dataset){
				self.setState({currentPage : "home", dataset: dataset});	
			});
		}.bind(this));
		this.pubsub_token = PubSub.subscribe("on_create_pollbutton_click", function(){
			this.setState({currentPage : "createpoll"});
		}.bind(this));
		this.pubsub_token = PubSub.subscribe("request_loading_page", function(){
			this.setState({currentPage : "loading"});
		}.bind(this));
		this.pubsub_token = PubSub.subscribe("request_error_page", function(){
			this.setState({currentPage : "error"});
		}.bind(this));
		this.pubsub_token = PubSub.subscribe("delete_button_clicked", function(name, index){
			self._onDelete(index);
		}.bind(this));
		this.pubsub_token = PubSub.subscribe("on_createpoll_succeed", function(){
			this._getPollingList(function(dataset){
				window.location.hash = "#detail#poll_id=" + (dataset.length - 1);
				self.setState({currentPage : "detail", dataset: dataset, selectedItem: (dataset.length - 1)});	
			}, true);
		}.bind(this));

		

		/*--------------------------------
			ROUTING
		//--------------------------------*/
		this._setRoute();
		var currentPage = "";
		for (var key in this.route) {
			if (window.location.hash.includes(key)) {
				currentPage = this.route[key];
				break;
			}
		}
		currentPage = currentPage == "" ? this.route.default : currentPage;

		if (currentPage == "home") {
			this._getPollingList(function(dataset){
				self.setState({currentPage : "home", dataset: dataset});	
			});
		}
		else if (currentPage == "detail") {
			this._getPollingList(function(dataset){
				self.setState({
					dataset : dataset
					, currentPage : "detail"
					, selectedItem : window.location.hash.split("=")[1]
				});
			})
		}
		else {
			this.setState({currentPage : currentPage});
		}
		
	},
	_onDelete : function(index){
		if (confirm("Are you sure you want to delete this poll?") == true) {
			var id = this.state.dataset[index]._id;
		    this.setState({currentPage : "loading"});
		    var self = this;
		    $.ajax({
		    	method: "DELETE",
		    	url: "/deletepoll",
		    	data : {
		    		 id : id
		    	},
		    	success : function(){
		    		self._getPollingList(function(dataset){
						self.setState({currentPage : "home", dataset: dataset});	
					}, true);
		    	},
		    	error : function(){
		    		this.setState({currentPage : "error"});
		    	}
		    });
		}
	},
	_onSeePollingDetailClick : function(i) {
		this.setState({
			currentPage : "detail",
			selectedItem : i
 		});
	},
	_onHomeButtonClick : function() {
		this.setState({currentPage: "home"});
	},
	_onDatasetChange : function(result) {
		this._getPollingList(function(data){
			return;
		}, true);
	},
	render : function(){
		//before anything else, check if user has access to soon-to-be rendered page
		//if not, show not authorized page
		if (!this._hasAccess()){
			return (
				<div>
					<h1>403!</h1>
					<p>You're not authorized to perform this action. Please login first</p>
				</div>
			)
		}

		var self = this;
		var dataset = JSON.parse(localStorage.getItem("dataset"));
		if (this.state.currentPage == "home") {
			return (
				<div>
				{dataset.map(function(item, i){
					var bound = self._onSeePollingDetailClick.bind(self, i);
					return (
						<PollItem author={item.author} index={i} see_polling_detail={bound} title={item.title} description={item.description} />
					);
				})}
				</div>
			);
		}
		else if (this.state.currentPage == "detail") {
			var selectedItem = this.state.selectedItem; //which poll user chose
			var bound = self._onHomeButtonClick.bind(this);
			return (
				<PollDetail onDatasetChange={this._onDatasetChange.bind(this)} index={selectedItem} homebutton={bound} dataset={dataset[selectedItem]} />
			);
		}
		else if (this.state.currentPage == "createpoll") {
			return (
				<CreatePollForm />
			);
		}
		else if (this.state.currentPage == "error") {
			return (
				<div>
					<h1>Error</h1>
					<p>Sorry, Something is wrong. Please try again</p>
				</div>
			)
		}
		else {
			//Loading
			return (
				<div>
					<h1>Loading...</h1>
					<p>Please wait</p>
				</div>
			);
		}
		
	}
});

module.exports = App;