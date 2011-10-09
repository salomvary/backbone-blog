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
		this.content = new ViewManager('[role=main]');
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
		console.log('TagView init', options.tag);
	}
});

LogView = Backbone.View.extend({
	debug: function(msg) {
		$('<div/>').text(msg).appendTo(this.el);
	}
});

$(function() {
	window.blog = new Blog({el:'body'});
});
