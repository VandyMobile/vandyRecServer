window.GFModel = {};

GFModel.FitnessClass = Backbone.Model.extend({

	//this property is used by other web clients 
	//to differentiate between models of this type
	//and models of other types when retrieving
	//JSON data
	type: 'GFClass',

	//url for POST, PUT, DELETE
	url: '/groupFitness', 
	idAttribute: '_id',
	initialize: function(modelData) {

		//timeRange is in the form 12:30pm - 1:30pm
		//note that there is no spaces in between a single
		//time elements but there is a space-dash-space between 
		//two different time elements
		this.set('timeRange', modelData.timeRange);
		this.set('instructor', modelData.instructor);
		this.set('location', modelData.location);
		this.set('dayOfWeek', modelData.dayOfWeek);
		//if the class is a 1-time occurence, then 
		//the start and end dates are the same
		//if the class keeps going, then the end date is blank
		this.set('startDate', modelData.startDate);
		this.set('endDate', modelData.endDate);
		//timeRange is in the process of becoming deprecated and
		//replaced by these two properties
		this.set('startTime', modelData.startTime);
		this.set('endTime', modelData.endTime);

		if (typeof modelData.cancelledDates !== 'undefined') {
			//an array of dateStrings for dates where the classes have been
			//cancelled.  The classes that have been cancelled are still retreived
			//from methods such as isOnDay
			this.set('cancelledDates', modelData.cancelledDates);
		} 

		if (typeof modelData.specialDateClass !== 'undefined') {
			console.log("Setting SDClass to "+modelData.specialDateClass);
			this.set('specialDateClass', modelData.specialDateClass);
		} else {
			this.set('specialDateClass', false);
		}

		this.set('type', 'GFClass');
	},
	//dateString in the format MM/DD/YYYY
	//where month is 1-based indexed
	isOnDay: function(year, monthIndex, day) {

		var date = new Date(year, monthIndex, day, 0,0,0,0),
			specialDates = GFModel.SpecialDates.getInstance();

		if (date.getDay() !== this.get('dayOfWeek') ) {
			return false;
		}

		//check if the date is before the start date
		if (DateHelper.earlierDate(date, this.getStartDate()) && !DateHelper.equalDates(date, this.getStartDate())) {
			return false;
		}

		//check if the date is after the end date
		if (typeof this.getEndDate() !== 'undefined' && DateHelper.earlierDate(this.getEndDate(), date) && !DateHelper.equalDates(this.getEndDate(), date)) {
			return false;
		}

		if (specialDates.includesDate(date) && !specialDates.isMember(this)) {
			return false;
		} else if (!specialDates.includesDate(date) && specialDates.isMember(this)) {
			return false;
		}
		return true;

	},
	
	//returns the day of the week the class exists
	getWeekDay: function() {
		return this.get('dayOfWeek');
	},
	getClassName: function() {
		return this.get('className');
	},
	getInstructor: function() {
		return this.get('instructor');
	},
	isRepeating: function() {
		if (typeof this.getEndDate() === 'undefined') {
			return true;
		}
		//repeating if the start and end dates are different and the end date is less than 1 week 
		//greater than the start date
		if ((this.getStartDate().getTime() + (7 * 24 * 60 * 60 * 1000)) > this.getEndDate().getTime()) {
			return false;
		}
		return true;
	},
	//takes a parameters of a date and sets the date range
	//so that the end date is before the date passed in
	//does not do anything if the date passed in is before the 
	//starting date.  Also removes the date that is passed in
	//returns a js object that has the same variables as the 
	//fitnessClass object but with the end date 1 week after 
	//the date being deleted, which can be used to create 
	//another fitnessClass if needed
	//with the return date as a start date.  Returns undefined if 
	//there is not valid date after the sliced date, and the sliced
	//date was the last date.  Returns undefined if the sliceDate is 
	//not in between the start and end dates
	slice: function(sliceDate) {
		
		//check if slice date is out of range of the start and end dates
		if ((typeof this.getEndDate() !== 'undefined' && !DateHelper.betweenDates(sliceDate, this.getStartDate(), this.getEndDate())) || (typeof this.getEndDate() === 'undefined' && DateHelper.earlierDate(sliceDate, this.getStartDate()) ) ) {
			return undefined;
		}

		if (!DateHelper.equalDates(sliceDate, this.getStartDate())) {

	
			//make sure that the slice date is of the same day of the week
			//and has no time value
			var dateChanged = false;
			while (sliceDate.getDay() !== this.getWeekDay()) {
				sliceDate.setDate(sliceDate.getDate() - 1);
				dateChanged = true;
			}
			DateHelper.dateWithEmptyTime(sliceDate);

			var returnUndefined = false;
			if (this.getEndDate() !== undefined && DateHelper.equalDates(sliceDate, this.getEndDate())) {
				returnUndefined = true;
			}

			//only reduce the date further if the slice date was not adjusted 
			//to match the day of the week
			if (!dateChanged) {
				sliceDate.setDate(sliceDate.getDate() - 7);
			}
			
			var startDateFactor;
			if (!dateChanged) {
				startDateFactor = 14;
			} else {
				startDateFactor = 7;
			}
			//construct date string and set it to end date
			var oldEndDate = this.get('endDate');
			this.set('endDate', DateHelper.dateStringFromDate(sliceDate));

			//save the new value of this class
			//should call PUT
			this.save({
				success: function() {console.log("saved");},
				error: function() {console.log("something went wrong");}
			});
			if (returnUndefined) {

				return undefined;
			} else {
				//create the return object
				var objectToReturn = {};
				objectToReturn.className = this.getClassName();
				objectToReturn.instructor = this.getInstructor();
				objectToReturn.timeRange = this.get('timeRange');
				//set the start date as the next valid date after the sliced date
				objectToReturn.startDate = DateHelper.dateStringFromDate(new Date(sliceDate.getTime() + (startDateFactor * 24 * 60 * 60 * 1000)));
				//set the end date on the return object as the old end date
				objectToReturn.endDate = oldEndDate;
				objectToReturn.dayOfWeek = this.getWeekDay();
				return objectToReturn;
			}

		} else {
			//should call destroy
			var that = this;
			console.log("deleting an element");
			this.destroy({
				headers: {_id: that.id }
			});
		}
		this.trigger('change');

	},
	//converts the string into a javascript date object
	//before returning the value
	getStartDate: function() {
		if (typeof this.get('startDate') === 'undefined') {
			return undefined;
		}
		return DateHelper.dateFromDateString(this.get('startDate'));
	},
	//converts the string into a javascript date object
	//before returning the value
	getEndDate: function() {
		if (typeof this.get('endDate') === 'undefined' || this.get('endDate') === '*') {
			return undefined;
		}
		return DateHelper.dateFromDateString(this.get('endDate'));
	},
	//returns true if this class is a class within a special date
	isSpecialDateClass: function() {
		return this.get('specialDateClass');
	},
	//this method does not do anything if the model is
	//not a member of a special date.  If it is, then
	//it slices the end date so that the end date ends 
	//before the special date ends (Keeps the model totally
	//within the bounds of the special date)
	//Assumes that the start date is set within the boundaries
	setSpecialDateBoundary: function() {
		if (this.isSpecialDateClass()) {
			GFModel.SpecialDates.getInstance().getSpecialDateForDate(this.getStartDate()).addFitnessClass(this);
		}
	},
	//this function adds a date where this fitness class is cancelled
	//this function takes a single parameter of either a date object or a date
	//string of the form MM/DD/YYYY, where MM is the month index, 1-based (01 is January)
	//note that the function isOnDay does not omit days that the fitness class is cancelled
	//does not add dates that are already in the cancelled dates array.

	addCancelDate: function(date) {
		if (!this.isCancelledForDate(date)) {
			var dateString;
			if (typeof date === 'object') {
				dateString = DateHelper.dateStringFromDate(date);
			} else if (typeof date === 'string') {
				dateString = date;
			}

			this.get('cancelledDates').push(dateString);
		}
		
	},
	//checks if the fitness class is cancelled on the date parameter
	//the date parameter can either be a date string or a date
	isCancelledForDate: function(date) {
		var dateString;
		if (typeof date === 'string') {
			dateString = date;
		} else if (typeof date === 'object') {
			dateString = DateHelper.dateStringFromDate(date);
		}

		var foundDate = false;
		this.get('cancelledDates').forEach(function(cancelledDate) {
			if (cancelledDate === dateString) {
				foundDate = true;
				return;
			}
		});
		return foundDate;
	},
	//the parameter can either be a dateString
	//or a date object.  Removes the matching 
	//date from the date array.  If the date is 
	//not in the date array, this does nothing
	removeCancelledDate: function(date) {
		var dateString;
		if (typeof date === 'string') {
			dateString = date;
		} else if (typeof date === 'object') {
			dateString = DateHelper.dateStringFromDate(date);
		}

		for (var index in this.get('cancelledDates')) {
			if (this.get('cancelledDates')[index] === dateString) {
				this.get('cancelledDates').splice(index, 1);
			}
		}
	}

});

//set of all classes within a given month
//used to put classes into views displayed to user
GFModel.FitnessClasses = (function() {

	var Instance = Backbone.Collection.extend({
		model: GFModel.FitnessClass,
		idAttribute: '_id',
		url: function() {
			
			return '/JSON/GF?type=GFClass&month='+this.month+'&year='+this.year;
		},
		//index of the month,
		//0-based index
		month: 0,
		//full year i.e. 2013
		year: 0, 

		//first weekday of the month
		//0=sunday, 6=saturday
		firstWeekDay: 0,
		//last weekday of the month
		lastWeekDay: 0,

		
		initialize: function(options) {
			this.month = options.month;
			this.year = options.year;
		},
		//get all the classes that are on a particular day
		//day is the day of the month, 1-based indexing, 2 is the second
		//day of the month, does nothing if the day passed in 
		//is out of the bounds for the days of a month
		//returns an array of the models on that particular day
		getClassesForDay: function(day) {
			var collection = this;
			var classes = [];
			this.forEach(function(fitnessClass) {
				
				if (fitnessClass.isOnDay(collection.year, collection.month, day)) {
					
					classes.push(fitnessClass);
				}
			});
			return classes;
		},
		//increments the date by a month and resets the models in the 
		//collection to correspond with the new month
		incrementMonth: function() {
			this.month+= 1;
			if (this.month > 11) {
				this.month = 0;
				this.year += 1;
			}
			this.fetch({
				reset:true,
				success: function() {this.trigger('monthChanged');}.bind(this)
			});
			
		},
		//decrements the month and seeks for new models using url query
		decrementMonth: function() {
			this.month -= 1;
			if (this.month < 0) {
				this.month = 11;
				this.year -=1;
			}
			this.fetch({
				reset: true,
				success: function() {this.trigger('monthChanged');}.bind(this)
			});
			
		},
		getCalendar: function(month, year) {
			//for getting month and year over 
			this.month = month;
			this.year = year;
			this.fetch(
				{
					reset: true,
					success: function() {this.trigger('monthChanged');}.bind(this)
				});
		},
		//creates a new model with the passed in data,
		//then persists that model to the database
		//this method then calls fetch to get an updated
		//set of models from the database after the model
		//has been added.  The model that was created is then
		//returned
		addNewClass: function(data) {
			//create
			var newFitnessClass = new GFModel.FitnessClass({
				className: data.className, 
				timeRange: data.timeRange,
				startDate: data.startDate,
				endDate: data.endDate,
				dayOfWeek: data.dayOfWeek,
				instructor: data.instructor,
				location: data.location,
				specialDateClass: data.specialDateClass,
				//cancelled dates will never be added on initialzation
				cancelledDates: []
				
			});
			//trigger the add event for the view to update
			//the calendar
			this.add(newFitnessClass);
			
			if (newFitnessClass.isSpecialDateClass()) {
				//clip the end date if this is a special date
				//setSpecialDateBoundary autmatically calls the save
				//method so the model is persisted to the database
				newFitnessClass.setSpecialDateBoundary();
			} else {
				newFitnessClass.save();
			}
			
			return newFitnessClass;
		},
		modelsWithinSpecialDate: function(specialDate) {
			var modelsToReturn = [];
			this.each(function(model) {
				if (specialDate.isMember(model)) {
					modelsToReturn.push(model);
				}
			});
			return modelsToReturn;
		}
	});

	return {
		getInstance: function() {
			if (!GFModel.FitnessClasses.instance) {
				var currentDate = new Date();
				GFModel.FitnessClasses.instance = new Instance({month: currentDate.getMonth(), year: currentDate.getYear() + 1900});
			}
			return GFModel.FitnessClasses.instance;
		}
	};

})();

	

//these are dates that are specified for unique scheduling
//all normal classes that are held are removed from these
//dates and new classes can be created on these dates that
//are not held at any other time
//there should never be two special dates that overlap
GFModel.SpecialDate = Backbone.Model.extend({

	idAttribute: '_id',
	type: 'GFSpecialDate',
	title: '',
	url: '/groupFitness',

	//represented as date strings
	startDate: '',
	endDate: '',

	initialize: function(options) {
		this.set('startDate', options.startDate);
		this.set('endDate', options.endDate);
		this.set('title', options.title);
		this.set('type', 'GFSpecialDate');
	},
	//this method takes the fitness class that is to be included and slices
	//the end date so that the ending date of the fitness class is still within
	//the bounds of the special date.  This method assumes that the starting date
	//is within the bounds of the special date already.  Only makes changes to the 
	//end date. Also assumes that the variable specialDateClass is set to true
	addFitnessClass: function(fitnessClass) {
		var sliceDate = this.getEndDate();
		//slice the date by the day after the end date so that the end date
		//is included within the boundaries
		sliceDate.setDate(sliceDate.getDate() + 1);
		fitnessClass.slice(sliceDate);
	},
	//returns true if the start date of the fitness class is within bounds
	//of the special date
	startDateWithinBounds: function(fitnessClass) {
		return this.includesDate(fitnessClass.getStartDate());
	},
	//returns true if this fitness class is a member of the 
	//Special Date
	isMember: function(fitnessClass) {
		return (fitnessClass.isSpecialDateClass() && this.includesDate(fitnessClass.getStartDate())); 
	},
	//either pass in a date or a date string
	//checks if the date is within the bounds of the 
	//special date
	includesDate: function(date) {
		var dateValue;
		if (typeof date === 'string') {
			//parameter is a date string
			dateValue = DateHelper.dateFromDateString(date);
		} else {
			dateValue = date;
		}
		return DateHelper.betweenDates(dateValue, this.getStartDate(), this.getEndDate());
	},
	//getters for the start and end dates of the special dates
	//converts the date string into date object before returning 
	//value (returns Date objects, not Strings)
	getStartDate: function() {
		return DateHelper.dateFromDateString(this.get('startDate'));
	},
	getEndDate: function() {
		return DateHelper.dateFromDateString(this.get('endDate'));
	},
	getTitle: function() {
		return this.get('title');
	},
	//returns true if the special date exists within the month
	isInMonth: function(month, year) {
		var startDate = this.getStartDate(),
			endDate = this.getEndDate();

		//either the start or end date has to be within the year for this to
		//be within the month, assuming that special dates do not
		//span a time period greater than a year
		if (startDate.getYear() + 1900 === year || endDate.getYear() + 1900 === year) {
			if (startDate.getMonth() === month || endDate.getMonth() === month) {
				return true;
			} else if (startDate.getMonth() < month && endDate.getMonth() > month) {
				return true;
			}
		}
		return false;
			
	},
	//should call this method instead of destroy
	//this makes sure that all the fitnessClasses
	//that are a member of this special date are 
	//also destroyed
	delete: function() {
		var fitnessClasses = GFModel.FitnessClasses.getInstance(),
			GFClassesToRemove = fitnessClasses.modelsWithinSpecialDate(this);

		GFClassesToRemove.forEach(function(model) {
			model.destroy({headers: {_id: model.id}});
		});
		this.destroy({headers: {_id: this.id}});
	}
});

GFModel.SpecialDates = (function() {
	var Instance = Backbone.Collection.extend({
		model: GFModel.SpecialDate,
		url: '/JSON/GF?type=GFSpecialDate',

		//returns the SpecialDate model for the passed in
		//fitnessClass.  If the fitness class does not
		//belong to any special dates, then this returns null
		getSpecialDateForClass: function(fitnessClass) {
			var returnObj = null;
			this.each(function(SpecialDate) {
				if (SpecialDate.isMember(fitnessClass)) {
					returnObj = SpecialDate;
					return;
				}
			});
			return returnObj;
		},
		//returns the special date with the given title
		//case-insensitive.  Returns null if there
		//is no special date with the given title
		getSpecialDateWithTitle: function(title) {
			var returnObj = null;
			this.each(function(SpecialDate) {
				if (title.toUpperCase() === SpecialDate.getTitle().toUpperCase()) {
					returnObj = SpecialDate;
					return;
				}
			});
			return returnObj;
		},
		//accepts a date string or date object
		//and returns the SpecialDate model
		//that includes this date
		//returns null if there is no special date
		//that has the parameter date within its bounds
		getSpecialDateForDate: function(date) {
			console.log("In the method");
			var returnObj = null;
			this.each(function(specialDate) {
				if (specialDate.includesDate(date)) {
					returnObj = specialDate;
					return;
				}
			});
			return returnObj;
		},
		//accepts a date string or a date object
		//and returns true if the date is within any
		//special date
		includesDate: function(date) {
			var includesDate = false;
			this.each(function(SpecialDate) {
				if (SpecialDate.includesDate(date)) {
					includesDate = true;
					return;
				}
			});
			return includesDate;
		},
		//returns true if the fitness class that is passed in as 
		//a parameter is a member of any special date in the collection
		isMember: function(fitnessClass) {
			var isMember = false;
			this.each(function(specialDate) {
				if (specialDate.isMember(fitnessClass)) {
					isMember = true;
					return;
				};
			});
			return isMember;
		},
		addNewSpecialDate: function(specialDate) {
			
			//save the model
			console.log("Adding a new special date");
			this.add(specialDate);
			specialDate.save();
			
		}

	});

	return {
		getInstance: function() {
			if (!GFModel.SpecialDates.instance) {
				GFModel.SpecialDates.instance = new Instance();
			}
			return GFModel.SpecialDates.instance;
		}
	};

})();

