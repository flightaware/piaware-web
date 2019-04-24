(function() {
	'use strict';

	// Translation utility function
	window.t = function(phrase) {
		translations = translations || {};
		if (phrase in translations) {
			var translation = translations[phrase];
			if (translation !== '') {
				return translation;
			}
		}

		return phrase;
	}

	// First we create our models and views.
	var Alert = Backbone.Model.extend({
		defaults: {
			visible: true,
			type: '',
			message: ''
		},

		hide: function() {
			this.set('visible', false);
		},

		show: function() {
			this.set('visible', true);
		}
	});

	var AlertView = Backbone.View.extend({
		template: _.template($('#alert-template').html()),

		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'change:visible', this.toggleVisible);
			this.render();
		},

		render: function() {
			var rendered = this.template(this.model.attributes);
			this.$el.html(rendered);
		},

		toggleVisible: function() {
			this.$el.toggleClass('hidden', !this.model.get('visible'));
		}
	});

	var StatsLink = Backbone.Model.extend({
		defaults: {
			url: '',
		},

		updateFromData: function(data) {
			if ('site_url' in data) {
				this.set('url', data['site_url']);
			} else {
				this.set('url', '');
			}
		}
	});

	var StatsLinkView = Backbone.View.extend({
		template: _.template($('#stats-template').html()),

		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},

		render: function() {
			if (this.model.get('url') == '') {
				this.$el.addClass('hidden');
			} else {
				this.$el.removeClass('hidden');
				var rendered = this.template(this.model.attributes);
				this.$el.html(rendered);
			}
		},
	});

	var ClaimLink = Backbone.Model.extend({
		defaults: {
			feeder_id: '',
		},

		updateFromData: function(data) {
			if ('unclaimed_feeder_id' in data) {
				this.set('feeder_id', data['unclaimed_feeder_id']);
			} else {
				this.set('feeder_id', '');
			}
		}
	});

	var ClaimLinkView = Backbone.View.extend({
		template: _.template($('#claim-template').html()),

		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},

		render: function() {
			if (this.model.get('feeder_id') == '') {
				this.$el.addClass('hidden');
			} else {
				this.$el.removeClass('hidden');
				var rendered = this.template(this.model.attributes);
				this.$el.html(rendered);
			}
		},
	});

	var Skyview1090MapLink = Backbone.Model.extend({
		defaults: {
			url: '/dump1090-fa/',
			text: 'Go to Skyview 1090 Map',
			visible: true,
		},

                updateFromData: function(data) {
                        if ('modes_enabled' in data && data['modes_enabled'] == true) {
                                this.set('visible', true);
                        } else {
                                this.set('visible', false);
                        }
                }
	});

	var Skyview1090MapLinkView = Backbone.View.extend({
		template: _.template($('#maplink-template').html()),

		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},

		render: function() {
			if (!this.model.get('visible')) {
				this.$el.addClass('hidden');
			} else {
				this.$el.removeClass('hidden');
				var rendered = this.template(this.model.attributes);
				this.$el.html(rendered);
			}
		},
	});

        var Skyview978MapLink = Backbone.Model.extend({
                defaults: {
			url: '/skyview978/',
			text: 'Go to Skyview 978 Map',
			visible: false,
                },

                updateFromData: function(data) {
                        if ('uat_enabled' in data && data['uat_enabled'] == true) {
                                this.set('visible', true);
                        } else {
                                this.set('visible', false);
                        }
                }
        });

        var Skyview978MapLinkView = Backbone.View.extend({
                template: _.template($('#maplink-template').html()),

                initialize: function() {
                        this.listenTo(this.model, 'change', this.render);
                        this.render();
                },

                render: function() {
                        if (!this.model.get('visible')) {
                                this.$el.addClass('hidden');
                        } else {
                                this.$el.removeClass('hidden');
                                var rendered = this.template(this.model.attributes);
                                this.$el.html(rendered);
                        }
                },
        });

	var Indicator = Backbone.Model.extend({
		defaults: {
			visible: false,
			name: '',
			title: '',
			status: '',
			message: ''
		},

		// Override Backbone's defaults -- our model isnt' persisted on a
		// server.
		sync: function() { return null; },
		fetch: function() { return null; },
		save: function() { return null; }
	});

	var IndicatorView = Backbone.View.extend({
		template: _.template($('#indicator-template').html()),

		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},

		render: function() {
			var rendered = this.template(this.model.attributes);
			this.$el.html(rendered);
		}
	});

	var IndicatorCollection = Backbone.Collection.extend({
		model: Indicator,

		setAll: function(attributes) {
			this.each(function(indicator) {
				indicator.set(attributes);
			});
		},

		// Determine if this indicator is present in the json file. If not, we
		// don't display it.
		determineVisible: function(data) {
			this.each(function(indicator) {
				if (indicator.get('name') in data) {
					indicator.set('visible', true);
				} else {
					indicator.set('visible', false);
				}
			});
		},

		// A custom function for updating our models, since the json data
		// doesn't match closely enough to what Backbone's fetch method expects.
		updateFromData: function(data) {
			this.each(function(indicator) {
				var name = indicator.get('name');
				if (name in data) {
					var dataIndicator = data[name];
					indicator.set({
						status: colorMap[dataIndicator.status],
						message: t(dataIndicator.message)
					});
				}
			});
		}
	});

	var IndicatorCollectionView = Backbone.View.extend({
		el: $('#indicators'),

		initialize: function() {
			var self = this;

			this.indicatorViews = [];
			this.collection.each(function(indicator) {
				self.indicatorViews.push(new IndicatorView({
					model: indicator
				}));
			});

			this.listenTo(this.collection, 'change', this.render);
		},

		render: function() {
			var self = this;

			this.$el.empty();
			$.each(this.indicatorViews, function(index, view) {
				if (view.model.get('visible')) {
					view.render();
					// We use .children() because we just want the rendered
					// template, not including the extra container div Backbone
					// creates.
					self.$el.append(view.$el.children());
				}
			});

			// Enable Bootstrap mouse hover tooltips.
			$('[data-toggle="tooltip"]').tooltip();
		}
	});

	// Maps status-file statuses to Bootstrap classes.
	var colorMap = {
		green: 'success',
		amber: 'warning',
		red: 'danger'
	};

	// These represent the possible status indicators. Only the ones actually
	// present in the json status file will be displayed. To add more
	// indicators, just add to this list.
	var indicators = new IndicatorCollection([
		{
			name: 'radio',
			title: 'Mode S Radio'
		},
		{
			name: 'uat_radio',
			title: 'UAT Radio'
		},
		{
			name: 'piaware',
			title: 'PiAware'
		},
		{
			name: 'adept',
			title: 'FlightAware'
		},
		{
			name: 'gps',
			title: 'GPS'
		},
		{
			name: 'mlat',
			title: 'MLAT'
		}
	]);

	var indicatorCollectionView = new IndicatorCollectionView({
		collection: indicators
	});

	var alert = new Alert();

	var alertView = new AlertView({
		el: '#alert',
		model: alert
	});

	var stats = new StatsLink();
	var statsView = new StatsLinkView({
		el: '#stats',
		model: stats
	});

	var claim = new ClaimLink();
	var claimView = new ClaimLinkView({
		el: '#claim',
		model: claim
	});

	var map = new Skyview1090MapLink();
	var mapView = new Skyview1090MapLinkView({
		el: '#map',
		model: map
	});

        var uatmap = new Skyview978MapLink();
        var uatmapView = new Skyview978MapLinkView({
                el: '#uatmap',
                model: uatmap
        });

	var interval = {
		id: undefined,
		setByData: false
	};

	$(function init() {
		$.getJSON('./status.json')
			.then(render)
			.then(pollJSON)
			.fail(handleError);
	});

	function pollJSON(data) {
		interval.id = setInterval(update, data.interval);
	}

	function update() {
		$.getJSON('./status.json')
			.then(setPollInterval)
			.then(render)
			.fail(handleError);
	}

	function setPollInterval(data) {
		// If the poll interval is the default one -- that is, it hasn't been
		// set using the value from status.json, then clear the old interval and
		// use the one from status.json.
		if (interval.setByData === false &&
				typeof data.interval !== 'undefined') {

			clearInterval(interval.id);
			interval.id = setInterval(update, data.interval);
			interval.setByData = true;
		}

		return data;
	}

	function handleError() {
		renderTranslations();
		displayFailure();

		// This only occurs if we've never received a valid status.json.
		if (typeof interval.id === 'undefined') {
			// We don't know which indicators should be enabled if we've never
			// gotten any data back, so we just display them all.
			indicators.setAll({
				visible: true
			});

			// Poll every 2 seconds by default until we get an interval from
			// status.json.
			pollJSON({interval: 2000});
		}
	}

	function render(data) {
		var isRunning = checkIsRunning(data);
		var serial = data.serial || "";
		renderTranslations({serial: serial});

		indicators.determineVisible(data);

		if (!isRunning) {
			displayFailure();

		} else if (isRunning) {
			indicators.updateFromData(data);
			stats.updateFromData(data);
			claim.updateFromData(data);
			map.updateFromData(data);
			uatmap.updateFromData(data);
			alert.hide();
		}

		return data;
	}

	function renderTranslations(opts) {
		var opts = opts || {};
		var serial = opts.serial || "";

		// Render the localized description.
		var template = _.template($('#description-template').html());
		$('#description').html(template({serial: serial}));

		// To add more translations, just wrap the phrase in some sort of html
		// tag on the page that you can select and provide the selector here.
		$.each([
			'#status',
			'#map-link'
		], function(index, item) {
			var $item = $(item);
			var phrase = $item.html();
			$item.html(t(phrase));
		});
	}

	function displayFailure() {
		indicators.setAll({
			status: colorMap.red,
			message: t("PiAware doesn't appear to be running!")
		});
		alert.set({
			type: 'danger',
			message: t("PiAware doesn't appear to be running!")
		});
		alert.show();

		stats.set('url', '');
		claim.set('feeder_id', '');
	}

	var prevTime;
	function checkIsRunning(data) {
		var isRunning = false;

		if (typeof prevTime === 'undefined' ||
				data.time > prevTime) {

			isRunning = true;
		}

		prevTime = data.time;

		return isRunning;
	}

})();
