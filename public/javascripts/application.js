require(['lib'], function(lib) {

Blog = lib.Controller.extend({
	routes: {
		'':            'main',
		'posts/:id':   'post',
		'tags/:tag':   'tag'
	},

	events: {
		'click a': 'linkClicked'
	},

	initialize: function() {
		this.log = new LogView({el: '#log'});
		this.content = new lib.ViewManager({el: '[role=main]'});
		this.breadcrumb = new Breadcrumb({el: 'header nav'});
		this.content.bind('show', this.breadcrumb.update, this.breadcrumb);

		this.twitter = new TwitterSearch({el: '#twitter'});
		this.content.bind('show', this.twitter.updateWithView, this.twitter);

		this.title = document.title;
		this.content.bind('show', function(view) {
			var title = view.model.get('title');
			document.title = title ? title + ' | ' + this.title : this.title;
		}, this);
	},

	main: function() {
		this.log.debug('main');
		this.content.show(MainView);
	},

	post: function(id) {
		this.log.debug('post ' + id);
		this.content.show(PostView, {id:id});
	},

	tag: function(tag) {
		this.log.debug('tag ' + tag);
		this.content.show(TagView, {id: tag});
	},

	linkClicked: function(event) {
		var href = event.currentTarget.getAttribute('href');
		if(href.indexOf(Backbone.history.options.root) === 0) {
			var fragment = href.substring(Backbone.history.options.root.length);
			Backbone.history.navigate(fragment, true);
			return false;
		}
	}

});

MainView = lib.RenderedView.extend({
	urlRoot: '/',
	initialize: function() {
		console.log('MainView init');
	}
});

PostView = lib.RenderedView.extend({
	urlRoot: '/posts',
	events: {
		'click': 'clicked'
	},
	initialize: function() {
		console.log('PostView init');
	},
	clicked: function(){
		console.log('PostView clicked');
	},
	parse: function(el) {
		return {
			title: el.find('h2').text()
		};
	}
});

TagView = lib.RenderedView.extend({
	urlRoot: '/tags',
	initialize: function(options) {
		console.log('TagView init', options.id);
	}
});

LogView = Backbone.View.extend({
	debug: function(msg) {
		$('<div/>').text(msg).appendTo(this.el);
	}
});

Breadcrumb = Backbone.View.extend({
	initialize: function() {
		this.main = $(this.el).children('a:first');
	},
	update: function(view) {
		this.main.nextAll().remove();
		if(view.urlRoot !== '/') {
			$('<span> » </span>')
				.insertAfter(this.main)
				.after($('<b/>', {text: view.urlRoot}));
		}
	}
});

Tweets = Backbone.Collection.extend({
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

TwitterSearch = Backbone.View.extend({

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
	},

	updateWithView: function(view) {
		if(view.model.get('title')) {
			var term = view.model.get('title').match(/\w+\W+\w+/)[0],
				el = $(this.el);
			this.collection.search({q: term, rpp:5})
				.done(function() {
					el.show();
				});
		} else {
			$(this.el).hide();
		}
	}
});

$(function() {
	window.blog = new Blog({el:'body'});
});

});
