/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(1);

	var HomeButton = __webpack_require__(2);
	var LoginButton = __webpack_require__(3);
	var App = __webpack_require__(5);

	ReactDOM.render(React.createElement(HomeButton, null), document.getElementById("navbar-brand"));
	ReactDOM.render(React.createElement(LoginButton, null), document.getElementById("login"));
	ReactDOM.render(React.createElement(App, null), document.getElementById("root"));

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(1);

	var HomeButton = React.createClass({
		displayName: 'HomeButton',

		render: function render() {
			return React.createElement(
				'a',
				{ href: '#home', onClick: this._onClick },
				'Voters'
			);
		},
		_onClick: function _onClick() {
			PubSub.publish('on_homebutton_click');
		}
	});

	module.exports = HomeButton;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(1);
	var Helper = __webpack_require__(4);

	var LoginButton = React.createClass({
		displayName: "LoginButton",

		mixins: [Helper],
		_onCreatepollClick: function _onCreatepollClick() {
			PubSub.publish("on_create_pollbutton_click");
		},
		render: function render() {
			if (this._getCookie("token") !== null) {
				window.isUserAuthed = true;
				return React.createElement(
					"div",
					{ className: "right-menu" },
					React.createElement(
						"a",
						{ href: "/signout", className: "buttonLogin" },
						"Sign Out"
					),
					React.createElement(
						"a",
						{ onClick: this._onCreatepollClick, href: "#createpoll", className: "createPollButton" },
						React.createElement("i", { className: "fa fa-plus fa-2x" })
					)
				);
			} else {
				window.isUserAuthed = false;
				return React.createElement(
					"a",
					{ href: "https://github.com/login/oauth/authorize?client_id=c73864bb2fa3040f875e", className: "buttonLogin" },
					React.createElement("i", { className: "fa fa-github" }),
					" Sign in with Github"
				);
			}
		}
	});

	module.exports = LoginButton;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	var Helper = {
		_getCookie: function _getCookie(name) {
			var dc = document.cookie;
			var prefix = name + "=";
			var begin = dc.indexOf("; " + prefix);
			if (begin == -1) {
				begin = dc.indexOf(prefix);
				if (begin != 0) return null;
			} else {
				begin += 2;
				var end = document.cookie.indexOf(";", begin);
				if (end == -1) {
					end = dc.length;
				}
			}
			return unescape(dc.substring(begin + prefix.length, end));
		}
	};

	module.exports = Helper;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(1);
	var PollItem = __webpack_require__(6);
	var PollDetail = __webpack_require__(7);
	var CreatePollForm = __webpack_require__(9);
	var Helper = __webpack_require__(4);
	var Routes = __webpack_require__(10);

	var App = React.createClass({
		displayName: "App",

		mixins: [Helper, Routes],
		getInitialState: function getInitialState() {
			return {
				dataset: [],
				currentPage: "",
				selectedItem: -1
			};
		},
		_getPollingList: function _getPollingList(callback, shouldGetFreshdata) {
			var dataset = JSON.parse(localStorage.getItem("dataset"));
			//if there's item in local storage,
			//and if shouldn't get fresh data,
			//and if not the very beginning request,
			//then use dataset from localStorage
			if (dataset.length > 0 && !shouldGetFreshdata && this.state.dataset.length > 0) {
				callback(dataset);
			} else {
				var self = this;
				$.ajax({
					method: "GET",
					url: "/findAllPoll",
					success: function success(dataset) {
						localStorage.setItem("dataset", dataset);
						callback(JSON.parse(dataset));
					},
					error: function error(jqxhr, textstatus) {
						self.setState({ currentPage: "error" });
					}
				});
			}
		},
		componentWillMount: function componentWillMount() {
			var self = this;

			/*--------------------------------
	  	subscribe to outside events
	  //--------------------------------*/
			this.pubsub_token = PubSub.subscribe("on_homebutton_click", (function () {
				this._getPollingList(function (dataset) {
					self.setState({ currentPage: "home", dataset: dataset });
				});
			}).bind(this));
			this.pubsub_token = PubSub.subscribe("on_create_pollbutton_click", (function () {
				this.setState({ currentPage: "createpoll" });
			}).bind(this));
			this.pubsub_token = PubSub.subscribe("request_loading_page", (function () {
				this.setState({ currentPage: "loading" });
			}).bind(this));
			this.pubsub_token = PubSub.subscribe("request_error_page", (function () {
				this.setState({ currentPage: "error" });
			}).bind(this));
			this.pubsub_token = PubSub.subscribe("delete_button_clicked", (function (name, index) {
				self._onDelete(index);
			}).bind(this));
			this.pubsub_token = PubSub.subscribe("on_createpoll_succeed", (function () {
				this._getPollingList(function (dataset) {
					window.location.hash = "#detail#poll_id=" + (dataset.length - 1);
					self.setState({ currentPage: "detail", dataset: dataset, selectedItem: dataset.length - 1 });
				}, true);
			}).bind(this));

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
			currentPage = currentPage == "" ? this.route["default"] : currentPage;

			if (currentPage == "home") {
				this._getPollingList(function (dataset) {
					self.setState({ currentPage: "home", dataset: dataset });
				});
			} else if (currentPage == "detail") {
				this._getPollingList(function (dataset) {
					self.setState({
						dataset: dataset,
						currentPage: "detail",
						selectedItem: window.location.hash.split("=")[1]
					});
				});
			} else {
				this.setState({ currentPage: currentPage });
			}
		},
		_onDelete: function _onDelete(index) {
			if (confirm("Are you sure you want to delete this poll?") == true) {
				var id = this.state.dataset[index]._id;
				this.setState({ currentPage: "loading" });
				var self = this;
				$.ajax({
					method: "DELETE",
					url: "/deletepoll",
					data: {
						id: id
					},
					success: function success() {
						self._getPollingList(function (dataset) {
							self.setState({ currentPage: "home", dataset: dataset });
						}, true);
					},
					error: function error() {
						this.setState({ currentPage: "error" });
					}
				});
			}
		},
		_onSeePollingDetailClick: function _onSeePollingDetailClick(i) {
			this.setState({
				currentPage: "detail",
				selectedItem: i
			});
		},
		_onHomeButtonClick: function _onHomeButtonClick() {
			this.setState({ currentPage: "home" });
		},
		_onDatasetChange: function _onDatasetChange(result) {
			this._getPollingList(function (data) {
				return;
			}, true);
		},
		render: function render() {
			//before anything else, check if user has access to soon-to-be rendered page
			//if not, show not authorized page
			if (!this._hasAccess()) {
				return React.createElement(
					"div",
					null,
					React.createElement(
						"h1",
						null,
						"403!"
					),
					React.createElement(
						"p",
						null,
						"You're not authorized to perform this action. Please login first"
					)
				);
			}

			var self = this;
			var dataset = JSON.parse(localStorage.getItem("dataset"));
			if (this.state.currentPage == "home") {
				return React.createElement(
					"div",
					null,
					dataset.map(function (item, i) {
						var bound = self._onSeePollingDetailClick.bind(self, i);
						return React.createElement(PollItem, { author: item.author, index: i, see_polling_detail: bound, title: item.title, description: item.description });
					})
				);
			} else if (this.state.currentPage == "detail") {
				var selectedItem = this.state.selectedItem; //which poll user chose
				var bound = self._onHomeButtonClick.bind(this);
				return React.createElement(PollDetail, { onDatasetChange: this._onDatasetChange.bind(this), index: selectedItem, homebutton: bound, dataset: dataset[selectedItem] });
			} else if (this.state.currentPage == "createpoll") {
				return React.createElement(CreatePollForm, null);
			} else if (this.state.currentPage == "error") {
				return React.createElement(
					"div",
					null,
					React.createElement(
						"h1",
						null,
						"Error"
					),
					React.createElement(
						"p",
						null,
						"Sorry, Something is wrong. Please try again"
					)
				);
			} else {
				//Loading
				return React.createElement(
					"div",
					null,
					React.createElement(
						"h1",
						null,
						"Loading..."
					),
					React.createElement(
						"p",
						null,
						"Please wait"
					)
				);
			}
		}
	});

	module.exports = App;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(1);
	var Helper = __webpack_require__(4);

	var PollItem = React.createClass({
		displayName: "PollItem",

		mixins: [Helper],
		_getExcerpt: function _getExcerpt(str, separator, num_of_word) {
			separator = separator || " ";
			var arr = str.split(separator);
			if (arr.length < num_of_word) {
				return str;
			}
			var result = "";
			for (var i = 0; i < num_of_word; i++) {
				if (arr[i] !== undefined) {
					result += arr[i] + separator;
				}
			}
			return result + "...";
		},
		_onDelete: function _onDelete() {
			PubSub.publish("delete_button_clicked", this.props.index);
		},
		render: function render() {
			var deleteButton = [];
			if (this.props.author == this._getCookie("token")) {
				deleteButton.push(React.createElement(
					"a",
					{ onClick: this._onDelete, href: "#", className: "pull-right" },
					React.createElement("i", { className: "fa fa-trash" })
				));
			}
			return React.createElement(
				"div",
				{ className: "panel panel-default" },
				React.createElement(
					"div",
					{ className: "panel-heading" },
					React.createElement(
						"h3",
						{ className: "panel-title" },
						this.props.title,
						deleteButton
					)
				),
				React.createElement(
					"div",
					{ className: "panel-body" },
					React.createElement(
						"div",
						{ className: "row" },
						React.createElement(
							"div",
							{ className: "col-xs-12" },
							this._getExcerpt(this.props.description, " ", 10),
							React.createElement("br", null),
							React.createElement(
								"a",
								{ onClick: this.props.see_polling_detail, href: "#detail#poll_id=" + this.props.index },
								"Click to see detail ",
								React.createElement("i", { className: "fa fa-chevron-circle-right" })
							)
						)
					)
				)
			);
		}
	});

	module.exports = PollItem;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var React = __webpack_require__(1);
	var Helper = __webpack_require__(4);
	var VoteForm = __webpack_require__(8);

	var PollDetail = React.createClass({
		displayName: 'PollDetail',

		mixins: [Helper],
		componentWillMount: function componentWillMount() {
			this.setState({ canvote: this._canUserVote() });
		},
		_canUserVote: function _canUserVote() {
			//determine wether user can vote / not
			var canvote = false;
			if (window.isUserAuthed) {
				console.log('user authed');
				var username_voters = this.props.dataset.username_voters;
				console.log('username voters = ' + username_voters);
				var token = this._getCookie("token");
				console.log('token = ' + token);
				//if voters not exist, allow to vote
				if (username_voters.indexOf(token) < 0) {
					console.log("yes, i can vote");
					canvote = true;
				}
			} else {
				console.log('user not authed');
				var ip_voters = this.props.dataset.ip_voters;
				console.log("ip_voters = " + ip_voters);
				var ip_address = this._getCookie("ip_address");
				console.log("ip_address = " + ip_address);
				//if voters not exist, allow to vote
				if (ip_voters.indexOf(ip_address) < 0) {
					console.log("yes, i can vote");
					canvote = true;
				}
			}
			console.log("CAN USER VOTE = " + canvote);
			return canvote;
		},
		_onFormSubmit: function _onFormSubmit(vote) {
			var self = this;
			var dataset = this.props.dataset;
			dataset.result[vote] += 1;

			$.ajax({
				url: "/vote",
				data: {
					vote: vote,
					_id: dataset._id
				},
				method: "PUT",
				success: function success(data) {
					//todo : change dataset record in parent
					var result = {
						index: self.props.index,
						data: data
					};
					self.props.onDatasetChange(result);
				}
			});

			this.setState({ dataset: dataset, canvote: false });
		},
		getInitialState: function getInitialState() {
			return {
				dataset: this.props.dataset,
				canvote: false
			};
		},
		_onDeleteLinkClicked: function _onDeleteLinkClicked() {
			PubSub.publish("delete_button_clicked", this.props.index);
		},
		render: function render() {
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
			options.push(React.createElement(
				'option',
				{ value: '-' },
				'-- Select your vote --'
			));
			var idx = 0;
			for (var key in data) {
				//building options
				options.push(React.createElement(
					'option',
					{ value: key },
					key.toUpperCase()
				));

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
					width: percentageWidth + "%"
				};
				graphs.push(React.createElement(
					'div',
					null,
					React.createElement('div', { style: style, className: classname }),
					React.createElement(
						'div',
						{ className: 'legend' },
						key.toUpperCase() + " : " + percentage + "%"
					)
				));
				idx++;
			}

			//building share link
			var getUrl = window.location;
			var baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
			var shareUrl = encodeURIComponent(baseUrl + "#detail#poll_id=" + this.props.index);
			var twitterLink = "https://twitter.com/intent/tweet?text=" + this.props.dataset.title + " Check out the vote result : " + shareUrl;

			//build delete button if the user is the authors
			var deleteButton = [];
			if (this.props.dataset.author == this._getCookie("token")) {
				deleteButton.push(React.createElement(
					'a',
					{ onClick: this._onDeleteLinkClicked, href: '#', className: 'deletePollLink' },
					React.createElement('i', { className: 'fa fa-trash' }),
					' Click to delete this poll'
				));
			}

			var boundFormSubmit = this._onFormSubmit.bind(this);

			//check if user can vote
			return React.createElement(
				'div',
				null,
				React.createElement(
					'ol',
					{ className: 'breadcrumb' },
					React.createElement(
						'li',
						null,
						React.createElement(
							'a',
							{ onClick: this.props.homebutton, href: '#home' },
							'Home'
						)
					),
					React.createElement(
						'li',
						null,
						this.props.dataset.title
					)
				),
				deleteButton,
				React.createElement('br', null),
				React.createElement(
					'h1',
					{ className: 'title' },
					this.props.dataset.title
				),
				React.createElement(
					'div',
					{ className: 'row' },
					React.createElement(
						'div',
						{ className: 'col-md-4' },
						React.createElement(VoteForm, { canvote: this.state.canvote, onFormSubmit: boundFormSubmit, index: this.props.index, options: options, dataset: this.props.dataset }),
						React.createElement('br', null),
						React.createElement(
							'a',
							{ target: '_blank', href: twitterLink, className: 'buttonShare' },
							React.createElement('i', { className: 'fa fa-twitter' }),
							' Tweet this to your followers'
						),
						React.createElement('br', null),
						React.createElement('br', null),
						this.props.dataset.description
					),
					React.createElement(
						'div',
						{ className: 'col-md-8' },
						React.createElement(
							'h3',
							null,
							'Poll Result (',
							sum,
							' votes): '
						),
						graphs
					)
				)
			);
		}
	});

	module.exports = PollDetail;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(1);

	var VoteForm = React.createClass({
		displayName: "VoteForm",

		_processVote: function _processVote(e) {
			e.preventDefault();
			this.props.onFormSubmit(this.refs.vote.value);
		},
		render: function render() {
			//if cannot vote
			if (!this.props.canvote) {
				return React.createElement(
					"form",
					{ ref: "voteform" },
					React.createElement(
						"div",
						{ className: "form-message" },
						"You've already voted"
					)
				);
			}

			return React.createElement(
				"form",
				{ ref: "voteform", onSubmit: this._processVote },
				React.createElement(
					"select",
					{ className: "form-control voteDropdown", ref: "vote" },
					this.props.options
				),
				React.createElement(
					"button",
					{ type: "submit", className: "buttonVote pull-left" },
					"Vote"
				),
				React.createElement("div", { className: "clearfix" }),
				React.createElement(
					"div",
					{ className: "form-message" },
					this.props.message
				)
			);
		}
	});

	module.exports = VoteForm;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var React = __webpack_require__(1);

	var CreatePollForm = React.createClass({
		displayName: "CreatePollForm",

		_sanitizeInput: function _sanitizeInput() {
			var arr = this.formdata.poll_options.split(",");
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].trim() == "") {
					continue;
				}
				arr[i] = arr[i].trim();
			}
			return {
				title: this.formdata.title.trim(),
				description: this.formdata.description.trim(),
				poll_options: arr.join(",")
			};
		},
		_validateForm: function _validateForm() {
			if (this.formdata.title == "" || this.formdata.description == "" || this.formdata.poll_options == "") {
				return false;
			}
			var arr = this.formdata.poll_options.split(",");
			if (arr.length >= 10) {
				return false;
			}
			return true;
		},
		_processForm: function _processForm(e) {
			e.preventDefault();
			this.formdata = {
				title: this.refs.title.value,
				description: this.refs.description.value,
				poll_options: this.refs.poll_options.value
			};

			if (this._validateForm()) {
				this.formdata = this._sanitizeInput();
				var self = this;
				PubSub.publish("request_loading_page");
				$.ajax({
					method: "POST",
					url: "/createpoll",
					data: self.formdata,
					success: function success(result) {
						PubSub.publish("on_createpoll_succeed");
					},
					error: function error(jqxhr, textstatus) {
						PubSub.publish("request_error_page");
					}
				});
			} else {
				alert("form is not valid. Please fill all fields, and make sure poll_options item amount is fewer than 10");
			}
		},
		render: function render() {
			return React.createElement(
				"form",
				{ id: "createpoll_form", ref: "createpoll_form", onSubmit: this._processForm },
				React.createElement(
					"h2",
					null,
					"Create New Poll"
				),
				React.createElement(
					"div",
					{ className: "input-group" },
					React.createElement(
						"label",
						null,
						"Poll title"
					),
					React.createElement("input", { name: "title", ref: "title", type: "text", className: "form-control", placeholder: "E.g : Democrat or Republican?" })
				),
				React.createElement(
					"div",
					{ className: "input-group" },
					React.createElement(
						"label",
						null,
						"Description"
					),
					React.createElement("input", { name: "description", ref: "description", type: "text", className: "form-control", placeholder: "Explain why anyone should vote" })
				),
				React.createElement(
					"div",
					{ className: "input-group" },
					React.createElement(
						"label",
						null,
						"Poll Options (comma separated, maximum 10 items)"
					),
					React.createElement("input", { name: "poll_options", ref: "poll_options", type: "text", className: "form-control", placeholder: "E.g : Democrat, Republican, Both" })
				),
				React.createElement("br", null),
				React.createElement(
					"button",
					{ type: "submit", className: "btn btn-primary" },
					"Submit"
				)
			);
		}
	});

	module.exports = CreatePollForm;

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	var Routes = {
		_setRoute: function _setRoute() {
			this.route = {
				'default': "home",
				'poll_id': "detail",
				'createpoll': 'createpoll'
			};
			this.authorizedOnlyRoutes = ['createpoll'];
		},
		_hasAccess: function _hasAccess() {
			var currentPage = this.state.currentPage;
			if (this.authorizedOnlyRoutes.indexOf(currentPage) > -1) {
				if (window.isUserAuthed) {
					return true;
				} else {
					return false;
				}
			}
			return true;
		}
	};

	module.exports = Routes;

/***/ }
/******/ ]);