Controller = function(options) {
	this.router = new Backbone.Router();
	_.each(this.routes, function(handler, route) {
		this.router.route(route, handler, _.bind(this[handler], this));
	}, this);
	Backbone.View.apply(this, arguments);
	Backbone.history.start({pushState: true});
};

_.extend(Controller.prototype, Backbone.View.prototype);
Controller.extend = Backbone.View.extend;

RenderedView = function(options) {
	var args = arguments;
	_.extend(this, $.Deferred());
	options = _.extend({}, options);

	if(! options.model) {
		options.model = new RenderedModel({
			id: options.id
		},{
			urlRoot: this.urlRoot
		});
	}

	Backbone.View.apply(this, args);
	this.model.bind('change', this.render, this);

	if($(this.el).is(':empty')) {
		var fetching = this.fetch();
	}

	$.when(fetching).done($.proxy(function() {
		this.resolve();
	}, this));
};

_.extend(RenderedView.prototype, Backbone.View.prototype, {
	fetch: function() {
		return this.model.fetch({dataType: 'html'});
	},
	render: function() {
		var replacement = $(this.model.get('html'));
		$(this.el).replaceWith(replacement);
		this.el = replacement.get(0);
		return replacement;
	}
});
RenderedView.extend = Backbone.View.extend;

RenderedModel = Backbone.Model.extend({
	initialize: function(attributes, options) {
		this.urlRoot = options.urlRoot;
	},
	parse: function(resp, xhr) {
		if(typeof resp === 'string') {
			return {html:resp};
		} else {
			return resp;
		}
	}
});

ViewManager = Backbone.View.extend({
	show: function(view, options) {
		if(this.view) {
			this.view.remove();
		} else if(! $(this.el).is(':empty')) {
			var existingContent = $(this.el).children(':first');
		}
		this.view = new view(_.extend({el: existingContent}, options));
		if(! existingContent) {
			$.when(this.view).always($.proxy(function() {
				$(this.el).html(this.view.el);
			}, this));
		}
		this.trigger('show', this.view);
	}
});
