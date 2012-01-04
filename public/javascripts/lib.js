define(['jquery', 'underscore', 'lib/backbone'], function($, _, Backbone) {

/**
 * A Controller is a view that is a {@link Backbone.Router} the same time.
 * This should be the main view of the application.
 *
 * @extends Backbone.View
 */
var Controller = function(options) {
	this.router = new Backbone.Router();
	_.each(this.routes, function(handler, route) {
		this.router.route(route, handler, _.bind(this[handler], this));
	}, this);
	Backbone.View.apply(this, arguments);
	Backbone.history.start({pushState: true});
};

_.extend(Controller.prototype, Backbone.View.prototype);
Controller.extend = Backbone.View.extend;

/**
 * A {@link Backbone.View} that can be rendered both on server 
 * and client side.
 * 
 * @extends Backbone.View
 */
var RenderedView = function(options) {
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
	this.model.bind('change:html', this.render, this);

	if($(this.el).is(':empty')) {
		var fetching = this.fetch();
	}

	$.when(fetching).done($.proxy(function() {
		this.model.set(this.parse($(this.el)));
		this.resolve();
	}, this));
};

_.extend(RenderedView.prototype, Backbone.View.prototype, {
	/**
	 * Fetches rendered html from the server.
	 */
	fetch: function() {
		return this.model.fetch({dataType: 'html'});
	},
	/**
	 * Renders View from server provided html.
	 */
	render: function() {
		var replacement = $(this.model.get('html'));
		$(this.el).replaceWith(replacement);
		this.el = replacement.get(0);
		this.trigger('render');
		return replacement;
	},
	parse: function(el) {
		return null;
	}
});
RenderedView.extend = Backbone.View.extend;

/**
 * A simple {@link Backbone.Model} for AJAX-fetching html fragments.
 *
 * @extends Backbone.Model
 */
var RenderedModel = Backbone.Model.extend({
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

/**
 * A {@link Backbone.View} that shows any number of other views 
 * which can be toggled exclusively.
 * 
 * @extends Backbone.View
 */
var ViewManager = Backbone.View.extend({
	/**
	 * Show the given view.
	 * 
	 * @param {Function} view The {@link Backbone.View} constructor to show.
	 * @param {Object} options Options to pass to the view's constructor.
	 */
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
				this.trigger('show', this.view);
			}, this));
		} else {
			this.trigger('show', this.view);
		}
	}
});

return {
	Controller: Controller,
	RenderedView: RenderedView,
	RenderedModel: RenderedModel,
	ViewManager: ViewManager
};

});
