Blog = Controller.extend({
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
		this.content = new ViewManager({el: '[role=main]'});
		this.breadcrumb = new Breadcrumb({el: 'header nav'});
		this.content.bind('show', this.breadcrumb.update, this.breadcrumb);
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

MainView = RenderedView.extend({
	urlRoot: '/',
	initialize: function() {
		console.log('MainView init');
	}
});

PostView = RenderedView.extend({
	urlRoot: '/posts',
	events: {
		'click': 'clicked'
	},
	initialize: function() {
		console.log('PostView init');
	},
	clicked: function(){
		console.log('PostView clicked');
	}
});

TagView = RenderedView.extend({
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

$(function() {
	window.blog = new Blog({el:'body'});
});
