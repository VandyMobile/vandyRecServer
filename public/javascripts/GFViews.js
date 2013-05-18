var MonthView = Backbone.View.extend({

	el: '#calendar',

	month: 0,
	day: 0,
	year: 0,

	initialize: function() {
		this.render();
	},
	render: function() {

	}

});

//this is not really a backbone view in that it has not real models but helps 
//delegate the display of models in a separate window
window.BlockView = Backbone.View.extend({

	//the day to display
	day: 0,
	//row and column on the calendar grid
	column: 0,
	row: 0,
	//the number of fitness classes to be held on this day
	numberOfFitnessClasses: 0,

	events: {
		'mouseover': 'hoverOn',
		'mouseout': 'hoverOff'
	},
	//for some reason, initialize is not setting up the element correctly, so 
	//for now, use this method
	setupView: function(row, column, day, numberOfFitnessClasses) {
		this.row = row;
		this.column = column;
		this.day = day;
		this.numberOfFitnessClasses = numberOfFitnessClasses;

		var columnSelector = "#cal-column-" + this.column;
		var rowSelector = ".cal-block-" + this.row;
		this.$el = $(columnSelector).children(rowSelector);
		//set up the element
		this.render();
	},
	render: function() {
		console.log("Called render");
		this.$el.append('<div class="dayIndicator">'+this.day+'</div>');
		if (this.numberOfFitnessClasses === 1) {

			this.$el.append('<div class="classCountIndicator">1 Class</div>');
		} else if (this.numberOfFitnessClasses > 1) {
			this.$el.append('<div class="classCountIndicator">'+this.numberOfFitnessClasses+" Classes</div>");

		}
	},
	hoverOn: function() {
		this.$el.animate( { backgroundColor: 'rgba(200, 200, 200, 1)' } );
	},
	hoverOff: function() {
		this.$el.animate( { backgroundColor: 'rgba(0, 0, 0, 0)' } );
	}
});