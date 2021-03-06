
var HoursView = {};


HoursView.HoursItem = (function() {


    function initialize(options) {
        this.render();

        //add events
        var self = this;
        this.model.on('change:name', function() {
            $('.hoursItem-name', self.$el).text(self.model.getName())
        });
        this.model.on('change:startDate', function() {
            $('.hoursItem-startDate', self.$el).text(self.model.get('startDate'));
            this.trigger('startDateChange');
        });

        this.model.on('change:endDate', function() {
            $('.hoursItem-endDate', self.$el).text(self.model.get('endDate'));

        });
        this.model.on('remove', function() {
            
            self.trigger('remove');

        });
    }

    function render() {
        this.$el.append('<div class="hoursItem-name">'+this.model.getName()+'</div>')
                .append('<div class="hoursItem-startDate">'+this.model.get('startDate')+'</div>')
                .append('<div class="hoursItem-endDate">'+this.model.get('endDate')+'</div>');
    }

    function showWindow() {
        
        (new HoursView.HoursWindow()).show().displayModel(this.model);
    }

    //value that is used to determine the sorted 
    //order of the hours list items
    //value must be a number
    function getSortValue() {
        return this.model.getStartDate().getTime();
    }

    return Backbone.View.extend({
        model: HoursModel.Hours,
        tagName: 'li',
        events: {
            'click': 'showWindow'
        },
        initialize: initialize,
        render: render,
        showWindow: showWindow,
        getSortValue: getSortValue
    });

})();


HoursView.HoursTable = (function() {

    function initialize(options) {
        //retrieve collection
        var collection = new HoursModel.HoursCollection();

        this.type = (!options || options.type === undefined) ? 0 : options.type;
        this.views = (! options || !Array.isArray(options.views)) ? [] : options.views;

        if (!this.isSorted()) {
            this.sort();
        }

        this.render();
        //register all the views for events
        this.views.forEach(function(view) {
            
            view.on('startDateChange', function() {

                if (!this.isSorted()) {
                    this.sort();
                    this.reload();
                }

            }.bind(this));
            view.on('remove', function() {
                this.views.forEach(function(aView, index) {
                    if (aView === view) {
                        this.removeView(aView, index);
                    }
                }.bind(this))
            }.bind(this));

        }.bind(this));

        //bind events for adding new events
        //the view responds to different events
        //depending on the type of table view it is
        //type 0 has no associated events because models cannot
        //be added or removed

        
        //abstracts the adding of the model
        //by placing the model in a view and 
        //calling add on the new view
        function addModel(model) {
            
            this.add(new HoursView.HoursItem({model: model}));
            this.reload();
        }

        if (this.type === 1) {
            collection.on('addFacilityHours', addModel.bind(this));
        } else if (this.type === 2) {
            collection.on('addClosedHours', addModel.bind(this));
        } else if (this.type === 3) {
            collection.on('addOtherHours', addModel.bind(this));
        }
    }

    function render() {
        //set the element to be the hours list at
        //index corresponding to the type number
        this.$el = $('.hoursList:eq('+this.type+')');

        //remove any children that might be in the view already
        this.$el.children().remove();

        //add elements from the views
        this.views.forEach(function(view) {
            this.$el.append(view.$el);
        }, this);
    }

    function getName() {
        //get the title within the text of the 
        //section header above the table element
        return this.$el.prev().text();
    }

    //the sort method sorts the array of views
    //but does not render the new sorted order
    function sort() {
        //sort the elements based on their sort values 
        //elements are in ascending sortValue order
        this.views.sort(function(view1, view2) {
            return view1.getSortValue() - view2.getSortValue();
        });
    }
    //reloads the views within the views array
    //to display in the order they are in the array
    function reload() {
        //remove all elements inside the table view
        //this method is reloading the table view
        this.$el.children().remove();

        //rerender all the elements within the view
        this.views.forEach(function(view) {
            this.$el.append(view.$el);
            //must rebind events
            view.$el.click(view.showWindow.bind(view));
        }, this);
    }
    //adds an HoursItem view to the end of the list and renders the item
    function push(hoursItem) {
        this.views.push(hoursItem);
        this.$el.append(hoursItem.$el);
    }
    //this method adds a view to the correct slot within the list
    //if the list is not sorted before this method is
    //called, the list is sorted before adding the new element
    //also binds events to the views that are being added
    //NOT COMPLETELY DOCUMENTED
    function add(hoursItem) {
        var itemAdded = false, i, n;
        if (this.views.length !== 0) {
            if (this.isSorted()) {
                for (i = 0, n = this.views.length; i < n && !itemAdded; ++i) {
                    
                    if (hoursItem.getSortValue() < this.views[i].getSortValue()) {
                        
                        itemAdded = true;
                        this.views = this.views.slice(0, i).concat([hoursItem]).concat(this.views.slice(i, n - i));
                        this.$el.children().eq(i).before(hoursItem.$el);

                    }
                }
                if (!itemAdded) {
                    //then append the element because it goes
                    //after all existing elemements
                    this.views.push(hoursItem);
                    this.$el.append(hoursItem.$el);
                }

            } else {
                
                this.views.push(hoursItem);
                this.sort();
                this.reload();
            }
        } else {
            this.views.push(hoursItem);
            this.$el.append(hoursItem.$el);
        }

        hoursItem.on('startDateChange', function() {

            if (!this.isSorted()) {
                this.sort();
                this.reload();
            }

        }.bind(this));
        hoursItem.on('remove', function() {
            this.views.forEach(function(aView, index) {
                if (aView === hoursItem) {
                    this.removeView(aView, index);
                }
            }.bind(this))
        }.bind(this));
  
    }
    //checks if the list is sorted
    function isSorted() {
        var i = 1;
        if (this.views.length === 0 || this.views.length === 1) {
            return true;
        }

        for (i = 1; i < this.views.length; ++i) {
            if (this.views[i].getSortValue() < this.views[i-1].getSortValue()) {
                return false;
            }
        }
        return true;
    }
    //NOT YET DOCUMENTED
    //for removing views within the array
    //and from the display
    function removeView(view, index) {
        
        var length = this.views.length;
        this.views = this.views.slice(0, index).concat(this.views.slice(index+1, length - index));
        view.$el.remove();
    }


    return Backbone.View.extend({
        type: 0,
        views: [],
        initialize: initialize,
        render: render,
        sort: sort,
        reload: reload,
        push: push,
        add: add,
        isSorted: isSorted,
        removeView: removeView
    });

})();


//calls save on the model when the window is exitted
//NOT COMPLETELY DOCUMENTED
HoursView.HoursWindow = function() {

    var instance;

    //redefine constructor
    HoursView.HoursWindow = function() {
        return instance;
    };

    //cache view incase HoursWindow needs a new instance to
    //be called
    this.cachedView =  (function() {

        function initialize() {
            var self = this;
            //define event here instead of above for the ability to access self
            $('#hoursWindow-priorityNumberSelect', this.$el).change(function() {

                self.model.set('priorityNumber', +$(this).val());
            });
        }

        function render() {
            
            var times = this.model.get('times'),
                i, n;

            $('#hoursWindow-title').text(this.model.getName());
            //clear all the existing elements within the hours of operation
            $('#hoursWindow-times', this.$el).children().remove();

            $('#hoursWindow-hoursStartDate', this.$el).text(this.model.get('startDate'));
            $('#hoursWindow-hoursEndDate', this.$el).text(this.model.get('endDate'));
            
            //append the times from the model to the view
            this.model.iterateTimes(function(obj, index) {

                this.appendHoursToView(index, obj);

            }, this);

            
            $('#hoursWindow-priorityNumber').hide();

            //render the view differently for baseHours
            //and non-baseHours
            if (this.model.isBaseHours()) {
                $('#hoursWindow-priorityNumberSelect').hide();
                $('#hoursWindow-priorityNumberBase').show();
                $('#hoursWindow-delete').hide();
                $('#hoursWindow-editDates').hide();
                $('#hoursWindow-editName').hide();
                $('#hoursWindow-closed').hide();
                $('#hoursWindow-times').show();
                
            } else {

                $('#hoursWindow-priorityNumberSelect').show();
                $('#hoursWindow-priorityNumberBase').hide();
                $('#hoursWindow-priorityNumber').val(this.model.getPriorityNumber().toString());
                $('#hoursWindow-delete').show();
                $('#hoursWindow-editDates').show();
                $('#hoursWindow-editName').show();

                //set the priority number to the priority number of the model
                $('#hoursWindow-priorityNumberSelect', this.$el).val(this.model.getPriorityNumber().toString());

                if (this.model.isClosed()) {
                    $('#hoursWindow-closed').show();
                    $('#hoursWindow-times').hide();
                } else {
                    $('#hoursWindow-closed').hide();
                    $('#hoursWindow-times').show();
                }
            }
        }
        //appends new hours to the time object
        function appendHoursToView(weekDay, timeObject) {
            var hours = $("<li class='hoursWindow-listItem' id='hoursWindow-times-"+weekDay+"'></li>")
                    .appendTo('#hoursWindow-times', this.$el)
                    //append these div tags to the element that 
                    //was just created
                    .append("<div class='hoursWindow-listItem-edit'>edit</div>")
                    .append("<div class='hoursWindow-listItem-title'>"+DateHelper.weekDayAsString(weekDay)+"</div>");

            $("<div class='hoursWindow-listItem-timeRange'></div>").appendTo(hours)
                .append("<span class='hoursWindow-listItem-startTime'>"+timeObject.startTime+"</span>")
                .append("<span>-</span>")
                .append("<span class='hoursWindow-listItem-endTime'>"+timeObject.endTime+"</span>");

            $("<div class='hoursWindow-listItem-sameAsAbove'>Same As Above</div>").appendTo(hours);

            //bind events to the element

            //edit events
            $('.hoursWindow-listItem-edit', hours).click($.proxy(this.editTimes, this));
            //same as above events
            $('.hoursWindow-listItem-sameAsAbove', hours).click($.proxy(this.sameAsAbove, this));
        }

        function remove() {
            var confirm = new ConfirmationBox(
                {
                    animate: false,
                    button1Name: 'YES',
                    button2Name: 'NO',
                    message: 'Are you sure you want to delete these hours?',
                    deleteAfterPresent: true
                });

            confirm.show();
            confirm.on('clicked1', function() {

                confirm.unbind('clicked1');
                confirm.unbind('clicked2');
                this.model.destroy({headers: {_id: this.model.get('_id')}});

            }.bind(this));

            confirm.on('clicked2', function() {

                confirm.unbind('clicked1');
                confirm.unbind('clicked2');

            }.bind(this));
             
        }
        //for rendering new models
        function displayModel(model) {


            this.model = model;
            this.didEdit = false;
            this.render();

            //bind events related to the model
            var self = this;
            this.model.on('change:name', function() {

                $('#hoursWindow-title', self.$el).text(self.model.getName());
            });

            //changing the start and end dates
            this.model.on('change:startDate', function() {
                
                $('#hoursWindow-hoursStartDate', self.$el).text(self.model.get('startDate'));
            });

            this.model.on('change:endDate', function() {
                
                $('#hoursWindow-hoursEndDate', self.$el).text(self.model.get('endDate'));
            });  

            //changing the times array
            this.model.on('change:times', function() { 
                //remove all the children and refresh the elements
                $('#hoursWindow-times', self.$el).children().remove();
                self.model.iterateTimes(function(obj, weekDay) {
                    this.appendHoursToView(weekDay, obj);
                }, self);

            });

            this.model.on('remove', function() {

                self.model = null;
                self.hide();
            });

            //listen for any changes in the model
            this.model.on('change', function() {
                self.didEdit = true;
            });
            //support method chaining
            return this;
        }
        //this method makes changes to the model and to 
        //the view
        function setHours(weekDay, timeObject) {
            this.model.setTimesForDay(weekDay, timeObject);
            var listElement = $('#hoursWindow-times-'+weekDay),
                startTimeEl, endTimeEl,
                foundPredecessor, predecessorIndex;

            if (listElement.length === 1) {
                //element exists
                startTimeEl = listElement.find('.hoursWindow-listItem-startTime');
                endTimeEl = listElement.find('.hoursWindow-listItem-endTime');

                startTimeEl.text(timeObject.startTime);
                endTimeEl.text(timeObject.endTime);
            } else {
                //the model should be responsible for creating the correct weekdays
                //necessary for the hours
                throw new Error("Accessing day of the week that does not exist in the model");
                 
            }
        }
        //get the week day of the list item at the given index in
        //the unordered list
        function getDayForItemAtIndex(index) {
            var length = $('#hoursWindow-times').children().length,
                element = (index < length) ? $('#hoursWindow-times').children().eq(index) : null,
                elementID = (element) ? element.attr('id') : null;
                if (elementID) {
                    return +(elementID.substr(elementID.length - 1, 1));
                }
                throw new Error("Searching for list item in hours of operation list using out of range index");
        }
        //NOT YET DOCUMENTED
        function editName() {
            var nameEdit = HoursView.HoursEdit().getInstance({type: 'name'});
            console.log("Edit name called");
            this.isEditting = true;
            //display edit window
            nameEdit.setName(this.model.getName());
            nameEdit.show();
            nameEdit.on('doneEdit', function() {
                
                this.model.set('name', nameEdit.name);
                console.log(this.model.getName());
                nameEdit.unbind('doneEdit');
                nameEdit.unbind('cancelEdit');
            }.bind(this));

            nameEdit.on('cancelEdit', function() {


                nameEdit.unbind('doneEdit');
                nameEdit.unbind('cancelEdit');
            });

        }
        function editTimes(event) {
            var hoursEdit = new HoursView.HoursEdit(), timeEdit;
            this.isEditting = true;
            //toggle isEditting
            var isEditting = (this.isEditting = !this.isEditting);

            //show window and bind events to check when to remove window
            var startTimeEl = $(event.delegateTarget).parent().find('.hoursWindow-listItem-startTime'),
                endTimeEl = $(event.delegateTarget).parent().find('.hoursWindow-listItem-endTime'),
                startTime = startTimeEl.text(),
                endTime = endTimeEl.text(),
                parentID = $(event.delegateTarget).parent().attr('id'),
                weekDay = +parentID.substr(parentID.length - 1, 1);

            timeEdit = hoursEdit.getInstance({type: 'times', startTime: startTime, endTime: endTime});
            timeEdit.show();
            timeEdit.on('doneEdit', function() {
                
                this.setHours(weekDay,
                    {
                        startTime: timeEdit.startTime, 
                        endTime: timeEdit.endTime
                    });
                
                //unbind all the events
                timeEdit.unbind('doneEdit');
                timeEdit.unbind('cancelEdit');
            }.bind(this));

            timeEdit.on('cancelEdit', function() {

                //unbind all the events
                timeEdit.unbind('doneEdit');
                timeEdit.unbind('cancelEdit');
            });
        }

        function editDates() {
            var hoursEdit = new HoursView.HoursEdit(),
                datesEdit;
            this.isEditting = true;
            datesEdit = hoursEdit.getInstance(
            {
                type: 'dates',
                startDate: this.model.get('startDate'), 
                endDate: this.model.get('endDate')
            });
            

            datesEdit.show();

            datesEdit.on('doneEdit', function() {
                
                this.model.setStartDate(datesEdit.startDate);
                this.model.setEndDate(datesEdit.endDate);
                
                //remove binding after either the done or cancel button
                //is pressed
                datesEdit.unbind('doneEdit');
                datesEdit.unbind('cancelEdit');

            }.bind(this));

            datesEdit.on('cancelEdit', function() {

                //remove binding after either the done or cancel button
                //is pressed
                datesEdit.unbind('doneEdit');
                datesEdit.unbind('cancelEdit');

            }.bind(this));

        }

        //NOT DOCUMENTED
        //this method does not do anything if the element is the 
        //first element in the list
        function sameAsAbove(event) {
            var currentEl = $(event.delegateTarget).parent(),
                currentID = currentEl.attr('id'),
                currentDay = +(currentID.substr(currentID.length - 1, 1)),
                previousEl = currentEl.prev(),
                previousID, previousDay;

                if (previousEl.length === 1) {
                    previousID = previousEl.attr('id');
                    previousDay = +(previousID.substr(previousID.length - 1, 1));

                    this.setHours(currentDay, this.model.getTimeObjectForDay(previousDay));
                }

        }

        function show(animate) {
            if (animate) {
                $('#hoursWindowPrimer').css({'z-index': 100}).fadeIn(400, function() {
                    this.$el.show();
                }.bind(this));
            } else {
                $('#hoursWindowPrimer').css({'z-index': 100}).show();
                this.$el.show();
            }
            return this;
            
        }

        function hide() {
             
            $('#hoursWindowPrimer').hide();
            this.$el.hide(); 
            if (this.didEdit) {
                this.model.save();
            }
            
            return this;
        }

        function hoverOnExit() {
            $('#hoursWindow-exit').animate({backgroundColor: '#c97b01'}, 400);
        }

        function hoverOffExit() {
            $('#hoursWindow-exit').animate({backgroundColor: 'rgba(0,0,0,0)'}, 400);
        }

        


        return Backbone.View.extend({
            el: '#hoursWindow',
            isEditting: false,
            didEdit: false,
            events: {
                'click #hoursWindow-exit': 'hide',
                'mouseenter #hoursWindow-exit': 'hoverOnExit',
                'mouseleave #hoursWindow-exit': 'hoverOffExit',
                'click #hoursWindow-editDates': 'editDates',
                'click #hoursWindow-delete': 'remove',
                'click #hoursWindow-editName': 'editName'
            },
            initialize: initialize,
            render: render,
            appendHoursToView: appendHoursToView,
            remove: remove,
            displayModel: displayModel,
            setHours: setHours,
            getDayForItemAtIndex: getDayForItemAtIndex,
            editName: editName,
            editTimes: editTimes,
            editDates: editDates,
            sameAsAbove: sameAsAbove,
            show: show,
            hide: hide,
            hoverOnExit: hoverOnExit,
            hoverOffExit: hoverOffExit

        });

       
    })();

    
    instance = new this.cachedView();
    return instance;

};




//NOT COMPLETELY DOCUMENTED
HoursView.HoursEdit = function() {
    

    //NOT YET DOCUMENTED
    nameEdit = function() {

        var instance;
        nameEdit = function() {
            return instance;
        };

        this.cachedView = (function() {

            //implement methods here
            return Backbone.View.extend({

                name: '',
                events: {
                    'click .hoursEdit-done input[value="done"]': 'done',
                    'click .hoursEdit-done input[value="cancel"]': 'cancel'
                },
                initialize: function(options) {
                    this.name = (options && options.name) ? options.name : 'Name Here';
                    this.render();
                },
                render: function() {
                    this.$el = $('#hoursEdit-editName');
                    $('.hoursEdit-body input', this.$el).val(this.name);
                },
                show: function() {
                    this.$el.show();
                },
                hide: function() {
                    this.$el.hide();
                },
                done: function() {
                    //get the input
                    this.name = $('.hoursEdit-body input', this.$el).val();
                    //clear the input
                    $('.hoursEdit-body input', this.$el).val('');
                    //trigger event
                    this.trigger('doneEdit');
                    this.hide();
                },
                cancel: function() {
                    this.trigger('cancelEdit');
                    this.hide();
                },
                setName: function(name) {
                    this.name = name;
                    $('.hoursEdit.body input').val(name);
                }
            });

        })();

        instance = new this.cachedView();
        return instance;
    };

    var hoursEditView = (function() {

        return hoursEdit = Backbone.View.extend({
            editDates: false,
            startDate: '01/01/2013',
            endDate: '01/02/2013',
            startTime: '12:00am',
            endTime: '08:00pm',

            render: function() {
                var startSelect, endSelect,
                    startArray, endArray,
                    i, daysInMonth, daysEl;
                //set the correct $el
                this.$el = (this.editDates) ? $('#hoursEdit-editDates') : $('#hoursEdit-editTimes');
                startSelect = $('.hoursEdit-startSelect', this.$el);
                endSelect = $('.hoursEdit-endSelect', this.$el);
                if (this.editDates) {
                    

                    startArray = DateHelper.splitDate(this.startDate);
                    endArray = DateHelper.splitDate(this.endDate);

                    //set the options for the day select tags
                    $('.hoursEdit-startSelect select:nth-child(2), .hoursEdit-endSelect select:nth-child(2)', this.$el).children().remove();

                    //create start date elements
                    daysEl = $('.hoursEdit-startSelect select:nth-child(2)', this.$el);
                    daysInMonth = DateHelper.daysForMonth(+startArray[0] - 1, +startArray[2]);
                    for (i = 1; i <= daysInMonth; ++i) {
                        
                        if (i < 10) {
                            daysEl.append('<option value="0'+i+'">'+i+'</option>');
                        } else {
                            daysEl.append('<option value="'+i+'">'+i+'</option>');
                        }  
                    }

                    //create end date elements
                    daysEl = $('.hoursEdit-endSelect select:nth-child(2)', this.$el);
                    daysInMonth = DateHelper.daysForMonth(+endArray[0] - 1, +endArray[2]);
                    for (i = 1; i <= daysInMonth; ++i) {
                        
                        if (i < 10) {
                            daysEl.append('<option value="0'+i+'">'+i+'</option>');
                        } else {
                            daysEl.append('<option value="'+i+'">'+i+'</option>');
                        }  
                    }

                } else {
                    startArray = DateHelper.splitTime(this.startTime);
                    endArray = DateHelper.splitTime(this.endTime);
                }

                


                for (i = 0; i < 3; ++i) {
                    startSelect.children().eq(i).val(startArray[i]);
                    endSelect.children().eq(i).val(endArray[i]);
                }
            },
            //setting up that requires render to have been
            //called.  This includes binding events to dynamically
            //bound $el
            //NOT YET DOCUMENTED
            bindEvents: function() {
                $('.hoursEdit-done input[value="done"]', this.$el).click($.proxy(this.didEdit, this));
                $('.hoursEdit-done input[value="cancel"]', this.$el).click($.proxy(this.didCancel, this));

                //bind change event
                if (this.editDates) {
                    //change the start and end date properties
                    //every time the select elements change
                    $('.hoursEdit-startSelect select:nth-child(2)', this.$el).change(function() {
                        this.startDate =    $('.hoursEdit-startSelect select:nth-child(1)', this.$el).val() + '/' +
                                            $('.hoursEdit-startSelect select:nth-child(2)', this.$el).val() +  '/' +
                                            $('.hoursEdit-startSelect select:nth-child(3)', this.$el).val();


                    }.bind(this));

                     $('.hoursEdit-endSelect select:nth-child(2)', this.$el).change(function() {
                        this.endDate =  $('.hoursEdit-endSelect select:nth-child(1)', this.$el).val() + '/' +
                                        $('.hoursEdit-endSelect select:nth-child(2)', this.$el).val() + '/' +
                                        $('.hoursEdit-endSelect select:nth-child(3)', this.$el).val();

                    }.bind(this));

                     //also bind events for generating the correct number of days when the month
                     //or year changes
                     $('.hoursEdit-endSelect select:nth-child(1), .hoursEdit-endSelect select:nth-child(3), .hoursEdit-startSelect select:nth-child(1), .hoursEdit-startSelect select:nth-child(3)', this.$el)
                        .change(function(event) {

                            var monthStr = $(event.delegateTarget).parent().children(':nth-child(1)').val(),
                                yearStr = $(event.delegateTarget).parent().children(':nth-child(3)').val(),
                                daysEl = $(event.delegateTarget).parent().children(':nth-child(2)'),
                                dayStr = daysEl.val(),
                                days = DateHelper.daysForMonth(+monthStr - 1, +yearStr),
                                newDay = +dayStr, 
                                i;

                            //if the old day is greater than the
                            //total number of days in the month,
                            //then set the new day value to the last
                            //day of the month
                            while (newDay > days) {
                                newDay--;
                            }
                            //reset the dayStr to the newDay value
                            //that has just been set
                            dayStr = (newDay < 10) ? '0' + newDay.toString() : newDay.toString();

                            daysEl.children().remove();

                            for (i = 1; i <= days; ++i) {
                                if (i < 10) {
                                    daysEl.append('<option value="0'+i+'">'+i+'</option>');
                                } else {
                                    daysEl.append('<option value="'+i+'">'+i+'</option>');
                                }  
                            }
                            daysEl.val(dayStr);

                            this.startDate= $('.hoursEdit-startSelect select:nth-child(1)', this.$el).val() + '/' +
                                            $('.hoursEdit-startSelect select:nth-child(2)', this.$el).val() +  '/' +
                                            $('.hoursEdit-startSelect select:nth-child(3)', this.$el).val();


                            this.endDate =  $('.hoursEdit-endSelect select:nth-child(1)', this.$el).val() + '/' +
                                            $('.hoursEdit-endSelect select:nth-child(2)', this.$el).val() + '/' +
                                            $('.hoursEdit-endSelect select:nth-child(3)', this.$el).val();
                            
                         }.bind(this));



                } else {
                    //change the start and end time properties
                    //every time the select elements change
                    $('.hoursEdit-startSelect select', this.$el).change(function() {

                        this.startTime =    $('.hoursEdit-startSelect select:nth-child(1)', this.$el).val() + ':' +
                                            $('.hoursEdit-startSelect select:nth-child(2)', this.$el).val() + 
                                            $('.hoursEdit-startSelect select:nth-child(3)', this.$el).val();

                    }.bind(this));

                    $('.hoursEdit-endSelect select', this.$el).change(function() {

                         this.endTime =     $('.hoursEdit-endSelect select:nth-child(1)', this.$el).val() + ':' +
                                            $('.hoursEdit-endSelect select:nth-child(2)', this.$el).val() + 
                                            $('.hoursEdit-endSelect select:nth-child(3)', this.$el).val();

                    }.bind(this));
                }
            },
            reset: function(options) {
                this.editDates = options.editDates;
                if (this.editDates) {
                    this.startDate = options.startDate;
                    this.endDate = options.endDate;
                } else {
                    this.startTime = options.startTime;
                    this.endTime = options.endTime;

                }
                this.render();
                return this;
            },
            didEdit: function() {
                
                this.hide();
                this.trigger('doneEdit');
                
            },
            didCancel: function() {
                
                this.hide();
                this.trigger('cancelEdit');
                
            },
            show: function() {
                this.$el.show();
                this.bindEvents();
            },
            hide: function() {
                this.$el.hide();
                $('.hoursEdit-done input[value="done"]', this.$el).unbind('click');
                $('.hoursEdit-done input[value="cancel"]', this.$el).unbind('click');
            }
        });

    })();


    return {
        //options:
        //type: can be 'name', 'dates', or 'times'
        //startDate and endDate are date strings for 'dates' type
        //startTime and endTime are time strings for 'time' type
        getInstance: function(options) {
            if (options) {
                if (options.type === 'dates') {
                    //get date instance
                    return (new hoursEditView()).reset(
                    {
                        editDates: true, 
                        startDate: options.startDate,
                        endDate: options.endDate
                    });

                } else if (options.type === 'times') {
                    //get time instance
                    return (new hoursEditView()).reset(
                    {
                        editDates: false,
                        startTime: options.startTime,
                        endTime: options.endTime
                    });

                } else {
                    //get name instance
                    return new nameEdit();
                }
            } else {
                throw new Error('Options are not defined for getInstance method');
            }
        }
    };

    
};




//other events

$('.hoursSectionHeader-add').click(function() {
    var collection = HoursModel.HoursCollection(),
        id = $(this).attr('id'),
        length = id.length,
        setNumber = +id.charAt(length - 1),
        facilityHours = (setNumber !== 3),
        closedHours = (setNumber === 2);

        
    collection.addModel(new HoursModel.Hours({

        priorityNumber: 1,
        facilityHours: facilityHours,
        closedHours: closedHours,
        name: 'New Hours',
        startDate: DateHelper.dateStringFromDate(new Date()),
        endDate: DateHelper.dateStringFromDate(new Date())

    }));


});




