var GFView = {};

//this is not really a backbone view in that it has not real models but helps 
//delegate the display of models in a separate window
GFView.BlockView = Backbone.View.extend({

	//the day to display
	day: 0,
	//row and column on the calendar grid
	column: 0,
	row: 0,
	//empty block defaults to false
	//empty means that this block does not represent a valid date
	empty: false,
	//the number of fitness classes to be held on this day
	fitnessClassesForBlock: [],

	events: {

		'mouseenter.dayBlock': 'hoverOn',
		'mouseleave.dayBlock': 'hoverOff',
		'click.dayBlock': 'showForm'
	},
	
	initialize: function(options) {
		//set the variables
		this.row = options.row;
		this.column = options.column;
		var columnSelector = "#cal-column-" + this.column;
		var rowSelector = ".cal-block-" + this.row;
		this.$el = $(columnSelector).children(rowSelector);

		if (options.empty === true) {
			this.empty = true;

		} else {
			this.empty = false;
			this.day = options.day;
			this.fitnessClassesForBlock = options.fitnessClassesForBlock;
		}
		this.render();
		
	},
	
	render: function() {
		if (this.empty) {
			this.$el.attr('empty', 'empty');
		}

		this.$el.append('<div class="dayIndicator">'+this.day+'</div>');
		if (this.fitnessClassesForBlock.length === 1) {

			this.$el.append('<div class="classCountIndicator">1 Class</div>');

		} else if (this.fitnessClassesForBlock.length > 1) {
			this.$el.append('<div class="classCountIndicator">'+this.fitnessClassesForBlock.length+" Classes</div>");

		} else {
			this.$el.append('<div class="classCountIndicator"><div>');
		}
		
	},
	//for resetting the view for another date 
	//without removing it
	reset: function(options) {
		//set the variables
		this.row = options.row;
		this.column = options.column;
		var columnSelector = "#cal-column-" + this.column;
		var rowSelector = ".cal-block-" + this.row;
		this.$el = $(columnSelector).children(rowSelector);
		if (options.empty === true) {
			this.empty = true;
			this.$el.attr('empty', 'empty');

		} else {
			this.empty = false;
			this.day = options.day;
			this.fitnessClassesForBlock = options.fitnessClassesForBlock;
		}
		
		this.rerender();

	},

	rerender: function() {
		this.$el.removeAttr('style');
		if (this.empty) {
			this.$el.attr('empty', 'empty');
		} else {
			this.$el.removeAttr('empty');
		}

		this.$('.dayIndicator').text(this.day.toString());
		if (this.fitnessClassesForBlock.length === 1) {

			this.$('.classCountIndicator').text('1 Class');

		} else if (this.fitnessClassesForBlock.length > 1) {

			this.$('.classCountIndicator').text(this.fitnessClassesForBlock.length+' Classes');
		} else { //0 classes
			this.$('.classCountIndicator').text('');
			
		}
	},
	hoverOn: function(event) {
		
		var partialSelector = $(event.delegateTarget).attr('class');
		
		$(event.delegateTarget).not('[empty]').animate({backgroundColor: 'rgba(200,200,200,1)'}, 200);
	},
	hoverOff: function(event) {
		
		$(event.delegateTarget).not('[empty]').animate({backgroundColor: 'rgba(0,0,0,0)'}, 200);
	},
	showForm: function(event) {
		
		if (typeof $(event.delegateTarget).attr('empty') === "undefined") {
			
			var dayOfWeekIndex = parseInt($(event.delegateTarget).parent().attr('id').charAt(11), 10);

			
			var windowTitle = DateHelper.weekDayAsString(dayOfWeekIndex) +', '+DateHelper.monthNameForIndex(parseInt($('#monthIndex').text(),10))+' '+$('.dayIndicator' , event.delegateTarget).text()+' '+$('#yearIndex').text();

			$('#formWindow-title').text(windowTitle);
			$('#dayIndex').text(this.day.toString());
			$('#dayOfWeekIndex').text(dayOfWeekIndex.toString());
			this.fitnessClassesForBlock.forEach(function(fitnessClass) {
				
				//false for no animation
				formWindowView.addClass(fitnessClass, false);
			});
			$('#windowPrimer').fadeIn(400, function() {
				$('#formWindow').show();
			});
		}
		
	}
	
});





//view for the calendar
//has no model but contains the collections and has 
//events that listen to changes in the collection in order to
//render data on the calendar
GFView.MonthView = Backbone.View.extend({

	el: '#calendar',
	//collection that is used by the view
	fitnessClasses: null,
	month: 0,
	year: 0,
	//2D array for blocks in the month view
	//this is an array of rows, and each row 
	//is an array of columns
	dayBlocks: [],

	initialize: function(options) {
		console.log("initialize");
		this.month = options.month;
		this.year = options.year;
		//this is a collection of backbone models
		//render is called by the reset event on fitness classes
		this.fitnessClasses = options.fitnessClasses;
		//set the reset event for rendering the calendar
		this.fitnessClasses.on('reset', this.render, this);
		
		this.fitnessClasses.fetch();
		
	},
	render: function() {
		console.log("render was called: " + this.fitnessClasses.models.length);
		//set the display to the month and year indication outside of
		//calendar element
		//month and year index tags are used for holding data that is not 
		//meant to be displayed, but used for rendering other elements
		//and creating models
		$('#month').text(DateHelper.monthNameForIndex(this.month));
		$('#monthIndex').text(this.month);
		$('#year').text(this.year.toString());
		$('#yearIndex').text(this.year.toString());
		//construct date
		//set iterationDate to the first of the month
		var foundFirstDay = false;
		var foundLastDay = false;
		var passedLastDay = false;
		var counter = 0;
		var iterationDate = new Date(this.year, this.month, 1, 0, 0, 0, 0);
		
		for (var row = 0; row < 6; ++row) {
			
			//initiate the nested array
			if (typeof this.dayBlocks[row] === 'undefined') {
				this.dayBlocks[row] = new Array(7);
			}
			
			
			for (var column = 0; column < 7; ++column) {
				

				//check for the first day 
				if (!foundFirstDay && iterationDate.getDay() === column) {
					foundFirstDay = true;

				} else if (foundLastDay) {

					passedLastDay = true;
				}else if (!foundLastDay && DateHelper.daysForMonth(iterationDate.getMonth(), this.year) === iterationDate.getDate()) {
					foundLastDay = true;
				}

				if (!foundFirstDay || passedLastDay) {
					
					//create an empty element
					if (typeof this.dayBlocks[row][column] === 'undefined') {

						this.dayBlocks[row][column] = new GFView.BlockView({row: row, column: column, empty: true});
					} else {

						this.dayBlocks[row][column].reset({row: row, column: column, empty: true});
					}
					

				} else {
					//create a filled column
					//set the number of fitness classes to 0 initially
					if (typeof this.dayBlocks[row][column] === 'undefined') {
						
						this.dayBlocks[row][column] = new GFView.BlockView({row: row, column: column, day: iterationDate.getDate(), fitnessClassesForBlock: this.fitnessClasses.getClassesForDay(iterationDate.getDate())});
					} else {
						

						this.dayBlocks[row][column].reset({row: row, column: column, day: iterationDate.getDate(), fitnessClassesForBlock: this.fitnessClasses.getClassesForDay(iterationDate.getDate())});
					}
					
					iterationDate.setDate(iterationDate.getDate() + 1);
					counter++;
				}	
			}
		}
	},
	incrementMonth: function() {
		this.month += 1;
		if (this.month > 11) {
			this.month = 0;
			this.year += 1;
			
		}
		this.fitnessClasses.incrementMonth();
	
	},
	decrementMonth: function() {
		this.month -= 1;
		if (this.month < 0) {
			this.month = 11;
			this.year -= 1;

		}
		//calls reset and renders new calendar
		this.fitnessClasses.decrementMonth();
	}
});

//this backbone view does take a model of a single class
//that it renders to a li
GFView.ClassView = Backbone.View.extend({

	className: 'formWindow-existingClass',
	tagName: 'li',
	
	initialize: function(options) {
		
		this.render(options.animate);
		//dynamically bind events to elements that are dynamically rendered
		if (this.model.isRepeating()) {
			$('.formWindow-existingClass-deleteMultiple').click($.proxy(this.deleteMany, this));
			$('.formWindow-existingClass-deleteOne').click($.proxy(this.deleteOne, this));
		} else {
			$('.formWindow-existingClass-deleteWhole').click($.proxy(this.deleteMany, this));
		}
		
		

	},
	//render the list item with necessary forms for
	//changing options
	render: function(animate) {
		
		if (animate) {
			this.$el = $('<li class="formWindow-existingClass" style="display: none;"></li>');
			this.$el.insertAfter('#formWindow-newClass');
		} else {
			this.$el = $('<li class="formWindow-existingClass"></li>')
			this.$el.insertAfter('#formWindow-newClass');
		}
		var endDate;
		if (typeof this.model.getEndDate() === 'undefined') {
			endDate = 'None';
		} else {
			endDate = this.model.get('endDate');
		}
		this.$el.append('<div class="formWindow-existingClass-className">'+this.model.getClassName()+'</div>');
		this.$el.append('<div class="formWindow-existingClass-instructor">'+this.model.getInstructor()+'</div>');
		this.$el.append('<div class="formWindow-existingClass-times">'+this.model.get('timeRange')+'</div>');
		this.$el.append('<div class="formWindow-existingClass-startDate">Start date: '+this.model.get('startDate')+'</div>');
		this.$el.append('<div class="formWindow-existingClass-endDate">End date: '+endDate+'</div>');

		//if the date is repeating, should show more than 1 delete options
		//if the date isn't repeating, then delete simply deletes the 1 instance
		if (this.model.isRepeating()) {
			$('#formWindow-newClass').next().append('<div class="formWindow-existingClass-deleteOptions"><input class="formWindow-existingClass-deleteMultiple" type="button" value="DELETE FUTURE CLASSES" /><input class="formWindow-existingClass-deleteOne" type="button" value="DELETE ONLY THIS" /></div>');
		} else {
			$('#formWindow-newClass').next().append('<div class="formWindow-existingClass-deleteOptions"><input class="formWindow-existingClass-deleteWhole" type="button" value= "DELETE" /></div>');
		}
		
		//dynamically add events to elements that were created

		if (animate) {
			$('#formWindow-newClass').next().slideDown();
		}
		
	},
	//for deleting a single instance
	deleteOne: function() {
	
		var currentDate = new Date(parseInt($('#yearIndex').text(), 10), parseInt($('#monthIndex').text(), 10), parseInt($('#dayIndex').text(), 10), 0,0,0,0);
		var newObjData = this.model.slice(currentDate);
		console.log(typeof newObjData);
		if (typeof newObjData === 'object') {
			console.log('found an object');
			fitnessClasses.addNewClass(newObjData);
		}
		this.$el.slideUp(400, function() {
			this.remove();
		});
		
		
	},
	//for deleting many instances
	deleteMany:function() {
		
		var currentDate = new Date(parseInt($('#yearIndex').text(), 10), parseInt($('#monthIndex').text(), 10), parseInt($('#dayIndex').text(), 10), 0,0,0,0);
		this.model.slice(currentDate);
		this.$el.slideUp(400, function() {
			this.remove();
		});
		//reload the data
		fitnessClasses.fetch();
	}
	
	

});

//does not have a single model that it renders
//manages the creation and deletion of models
//that are being rendered in the window form
GFView.ClassForm = Backbone.View.extend({

	el: '#formWindow-classes',

	events: {

		'click #formWindow-newClass-title': 'toggleForm',
		'click #formWindow-newClass-submitNewClass': 'submit',
		'click #formWindow-exit': 'exit'
		//need events to manage selections and changes to existing classes
		//event for submission
		//event for changing select elements
	},


	initialize: function(options) {

		//binding events that are not within the view
		$('#windowPrimer, #formWindow-exit').click($.proxy(this.exit, this));
		$('#formWindow-exit').mouseenter($.proxy(this.hoverOnExit, this));
		$('#formWindow-exit').mouseleave($.proxy(this.hoverOffExit, this));	
	},
	render: function() {

	},
	//adds class that was submitted by the form
	//and appends it immediately after the class creation
	//form, data should be passed from the form
	addClass: function(model, animate) {
		
		var classView = new GFView.ClassView({model: model, animate: animate});
		//slide animation
		this.$('#formWindow-newClass-form').slideUp();
		
	},
	//this toggles the appearance of the new class form
	toggleForm: function() {
		$('#formWindow-newClass-form').slideToggle();
	},
	//returns true if document is ready
	//to be submitted, returns error message
	//if the document is not ready to be submitted
	validateSubmission: function() {
		if ($('#formWindow-newClass-className-input').val() === '') {
			return "You need to enter a name";
		} else if ($('#formWindow-newClass-instructorName-input').val() === '') {
			return "You need to enter an instructor";
		}

		return true;
	},
	//called when the submit button is hit
	submit: function() {
		var validation = this.validateSubmission();
		if (validation === true) {
			$('#formWindow-newClass-error').hide();
			//submission process

			//construct a data object with the correct fields
			//move this code to the GFClassView object
			var data = {};
			data.className = $('#formWindow-newClass-className-input').val();
			data.instructor = $('#formWindow-newClass-instructorName-input').val();
			data.dayOfWeek = parseInt($('#dayOfWeekIndex').text(), 10);
			data.timeRange = $('#formWindow-newClass-startTime .formWindow-newClass-selectWrapper .formWindow-newClass-hours').children(':selected').text()+':'+
			$('#formWindow-newClass-startTime .formWindow-newClass-selectWrapper .formWindow-newClass-minutes').children(':selected').text()+
			$('#formWindow-newClass-startTime .formWindow-newClass-selectWrapper .formWindow-newClass-ampm').children(':selected').text()+' - '+
			$('#formWindow-newClass-endTime .formWindow-newClass-selectWrapper .formWindow-newClass-hours').children(':selected').text()+':'+
			$('#formWindow-newClass-endTime .formWindow-newClass-selectWrapper .formWindow-newClass-minutes').children(':selected').text()+
			$('#formWindow-newClass-endTime .formWindow-newClass-selectWrapper .formWindow-newClass-ampm').children(':selected').text();
			
			var monthString;
			//convert month to 1-based for date string
			var monthIndex = parseInt($('#monthIndex').text(), 10) + 1;
			if (monthIndex < 10) {
				monthString = '0'+ monthIndex.toString();
			} else {
				monthString = monthIndex.toString();
			}

			var dayString;
			if ($('#dayIndex').text().length === 1) {
				dayString = '0' + $('#dayIndex').text();
			} else {
				dayString = $('#dayIndex').text();
			}

			var yearString = $('#yearIndex').text();
			
			data.startDate = monthString + '/' + dayString + '/' + yearString;
			if ($("input[name='isRepeated']:checked", '#formWindow-newClass-repeatSelections').val() === 'true') {
				data.endDate = '*';
			} else {
				data.endDate = data.startDate;
			}
			//for now, set animated to true
			this.addClass(new FitnessClass(data), true);
			fitnessClasses.addNewClass(data);

		} else {
			//present the error message
			$('#formWindow-newClass-error').text(validation);
			$('#formWindow-newClass-error').show();
		}
		this.formToDefault();
	},
	exit: function() {
		$('#windowPrimer').hide();
		$('#formWindow').hide();
		//hide the form if it was open
		$('#formWindow-newClass-form').hide();
		//remove all exsiting class list items
		$('.formWindow-existingClass').remove();
	},
	hoverOnExit: function() {
		$('#formWindow-exit').animate({backgroundColor: '#cb7c01'}, 200);
	},
	hoverOffExit: function() {
		$('#formWindow-exit').animate({backgroundColor: 'rgba(0,0,0,0)'}, 200);
	},
	//converts the form back to its default values
	//should be called after submission so that values are cleared
	//and buttons are reset
	formToDefault: function() {
		$('#formWindow-newClass-className-input').val('');
		$('#formWindow-newClass-instructorName-input').val('');
		$('#formWindow-newClass-startTime .formWindow-newClass-selectWrapper .formWindow-newClass-hours').val('12');
		$('#formWindow-newClass-startTime .formWindow-newClass-selectWrapper .formWindow-newClass-minutes').val('00');
		$('#formWindow-newClass-startTime .formWindow-newClass-selectWrapper .formWindow-newClass-ampm').val('am');
		$('#formWindow-newClass-endTime .formWindow-newClass-selectWrapper .formWindow-newClass-hours').val('1');
		$('#formWindow-newClass-endTime .formWindow-newClass-selectWrapper .formWindow-newClass-minutes').val('00');
		$('#formWindow-newClass-endTime .formWindow-newClass-selectWrapper .formWindow-newClass-minutes').val('am');

	}
});

var formWindowView = new GFView.ClassForm();

//set up other events
$('#leftArrow').click(function() {
	monthView.decrementMonth();
});

$('#rightArrow').click(function() {
	monthView.incrementMonth();
});

