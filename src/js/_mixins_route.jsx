var Routes = {
	_setRoute : function() {
		this.route = {
			'default' : "home",
			'poll_id' : "detail",
			'createpoll' : 'createpoll'
		};
		this.authorizedOnlyRoutes = [
			'createpoll'
		];
	},
	_hasAccess : function() {
		var currentPage = this.state.currentPage;
		if (this.authorizedOnlyRoutes.indexOf(currentPage) > -1) {
			if (window.isUserAuthed) {
				return true;	
			}
			else {
				return false;
			}
		}
		return true;
	},
}

module.exports = Routes;