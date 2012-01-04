define(['jquery', 'lib/backbone'], function($, Backbone) {

var Tweets = Backbone.Collection.extend({
	searchUrl: 'http://search.twitter.com/search.json?callback=?&',

	search: function(params) {
		this.url = this.searchUrl +
			$.param(params);
		return this.fetch();
	},

	parse: function(response) {
		return response.results;
	}

});

var TwitterSearch = Backbone.View.extend({

	initialize: function() {
		this.collection = new Tweets()
			.bind('reset', this.render, this);
	},

	render: function() {
		var el = $(this.el);
		el.empty();
		this.collection.each(function(tweet) {
			el.append($('<li/>',{text: tweet.get('text')}));
		});
		return this;
	}

});

return {
	TwitterSearch: TwitterSearch,
	Tweets: Tweets
};

});
