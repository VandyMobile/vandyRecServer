//NEED TO ADD CHECKS FOR ISEDITTING WITHIN THE VIEW OBJECTS

//Declarations
var NameView,
	SeasonView,
	E_DatesView,
	S_DatesView,
	TeamsView,
	GamesView,
	EditView,

	//variables for instances

	sportModel,
	nameView,
	seasonView,
	entryDatesView,
	seasonDatesView,
	teamsView,
	gamesView,
	errors;


function getQueryString (key) {
	var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi');
	var r=[], m;
	while ((m=re.exec(document.location.search)) != null) r.push(m[1]);
	return r;
}

//sets up the error display so that errors can be viewed
//makes sure that 
function setupErrorsDisplay (errors) {
	if (errors && errors.length) {
		$('#errors').show();
		errors.forEach(function(error) {
			$('#errors ul').append('<li>'+error+'</li>');
		});
		//add click event to errors
		$('#errors div').click(function() {
			$('#errors ul').slideToggle();
		});
	}
}

//Views
NameView = Backbone.View.extend({
	el: '#sportName',
	sportName: '',
	events: {
		'click div': 'editName'
	},
	initialize: function(model) {
		$('h3', this.$el).text(model.get('sport'));

		this.model = model;
		model.on('change:sport', function() {
			
			this.sportName = model.get('sport');
			$('h3', this.$el).text(model.get('sport'));
		}.bind(this));
	},
	editName: function() {
		var nameEdit = EditView.getInstance('name');

		nameEdit.show();
		nameEdit.on('submit', function() {
			this.model.set('sport', nameEdit.sportName);

			nameEdit.unbind('submit');
			nameEdit.unbind('cancel');
		}.bind(this));
		nameEdit.on('cancel', function() {
			nameEdit.unbind('submit');
			nameEdit.unbind('cancel');
		});
	}
});

NameView.getInstance = function() {
	if (!NameView.instance) {
		NameView.instance = new NameView(sportModel);
	}
	return NameView.instance;
};

SeasonView = Backbone.View.extend({
	el: '#season',
	events: {
		'click div': 'editSeason'
	},
	season: 0,
	initialize: function(model) {
		var seasonString;
		this.model = model;
		this.season = model.get('season');

		this.season = model.get('season');
		if (this.season === 0) {
			seasonString = "Season: Fall";
		} else if (this.season === 1) {
			seasonString = "Season: Winter";
		} else if (this.season === 2) {
			seasonString = "Season: Spring";
		} else {
			//season is 3 (or it should be)
			seasonString = "Season: Summer";
		}
		$('#season h3').text(seasonString);

		model.on('change:season', function() {
			var seasonString, season = model.get('season');
			this.season = season;
			if (season === 0) {
				seasonString = "Season: Fall";
			} else if (season === 1) {
				seasonString = "Season: Winter";
			} else if (season === 2) {
				seasonString = "Season: Spring";
			} else {
				//season is 3 (or it should be)
				seasonString = "Season: Summer";
			}

			$('#season h3').text(seasonString);
		}.bind(this));
	},
	editSeason: function() {
		var seasonEdit = EditView.getInstance('season');

		seasonEdit.season = this.season;
		seasonEdit.show();
		seasonEdit.on('submit', function() {

			this.model.set('season', seasonEdit.season);

			seasonEdit.unbind('submit');
			seasonEdit.unbind('cancel');
		}.bind(this));
		seasonEdit.on('cancel', function() {

			seasonEdit.unbind('submit');
			seasonEdit.unbind('cancel');
		});
	}
});

SeasonView.getInstance = function() {
	if (!SeasonView.instance) {
		SeasonView.instance = new SeasonView(sportModel);
	}
	return SeasonView.instance;
};

E_DatesView = Backbone.View.extend({
	el: '#entryDates',
	startDate: '',
	endDate: '',
	isHidden: true,
	events: {
		'click .edit': 'editDates'
	},
	//pass in the model here and the needed data is extracted
	initialize: function(model) {

		this.model = model;
		this.startDate = model.get('entryDates').start;
		this.endDate = model.get('entryDates').end;

		$('span:nth-of-type(1)', this.$el).text(this.startDate);
		$('span:nth-of-type(2)', this.$el).text(this.endDate);

		//always listen to unexpected changed in the model
		model.on('change:entryDates', function() {

			this.startDate = model.get('entryDates').start;
			this.endDate = model.get('entryDates').end;
			$('span:nth-of-type(1)', this.$el).text(this.startDate);
			$('span:nth-of-type(2)', this.$el).text(this.endDate);

		}.bind(this));
	},
	editDates: function() {
		var datesEdit = EditView.getInstance('dates');

		datesEdit.startDate = this.startDate;
		datesEdit.endDate = this.endDate;
		datesEdit.show();

		datesEdit.on('submit', function() {
			//registered event takes care of setting the views parameters and 
			//rendering the correct dates
			this.model.set('entryDates', {start: datesEdit.startDate, end: datesEdit.endDate});
			//this.startDate = datesEdit.startDate;
			//this.endDate = datesEdit.endDate;

			datesEdit.unbind('submit');
			datesEdit.unbind('cancel');

		}.bind(this));

		datesEdit.on('cancel', function() {

			datesEdit.unbind('submit');
			datesEdit.unbind('cancel');
		});

	}
});


E_DatesView.getInstance = function() {
	if (!E_DatesView.instance) {
		E_DatesView.instance = new E_DatesView(sportModel);
	}
	return E_DatesView.instance;
};

S_DatesView = Backbone.View.extend({
	el: '#seasonDates',
	startDate: '',
	endDate: '',
	events: {
		'click .edit': 'editDates'
	},
	initialize: function(model) {
		this.model = model;
		this.startDate = model.get('seasonDates').start;
		this.endDate = model.get('seasonDates').end;
		$('span:nth-of-type(1)', this.$el).text(this.startDate);
		$('span:nth-of-type(2)', this.$el).text(this.endDate);

		model.on('change:seasonDates', function() {
			this.startDate = model.get('seasonDates').start;
			this.endDate = model.get('seasonDates').end;
			$('span:nth-of-type(1)', this.$el).text(this.startDate);
			$('span:nth-of-type(2)', this.$el).text(this.endDate);

		}.bind(this));
	},
	editDates: function() {
		var datesEdit = EditView.getInstance('dates');
		datesEdit.startDate = this.startDate;
		datesEdit.endDate = this.endDate;
		datesEdit.show();
		datesEdit.on('submit', function() {

			this.model.set('seasonDates', {start: datesEdit.startDate, end: datesEdit.endDate});

			datesEdit.unbind('submit');
			datesEdit.unbind('cancel');
		}.bind(this));

		datesEdit.on('cancel', function() {
			datesEdit.unbind('submit');
			datesEdit.unbind('cancel');
		});
	}
});

S_DatesView.getInstance = function() {
	if (!S_DatesView.instance) {
		S_DatesView.instance = new S_DatesView(sportModel);
	}
	return S_DatesView.instance;
};

TeamsView = Backbone.View.extend({
	el: '#teams',
	isShowing: false,
	teams: [],
	events: {
		'click div:nth-child(1)': 'toggle',
		'click ul li div:nth-child(5)': 'editTeam',
		'click ul li div:nth-child(6)': 'confirmRemoveTeam',
		'click ul li div:nth-child(7)': 'dropTeam',
		'click #addTeam': 'addTeam'	
	},
	initialize: function(model) {
		var i, n;
		this.model = model;
		this.teams = model.get('teams');

		//setting the teams elements
		this.resetTeams();
		this.model.on('change:teams', function() {
			console.log("Change teams was called");
			this.teams = model.get('teams');
			this.resetTeams();

		}.bind(this));
		
		//add separate event for clicking the edit button
		//so that the event is registered with the specific 
		//element that is clicked instead of this.$el
		//$('ul li div:nth-child(5)', this.$el).click($.proxy(this.editTeam, this));
		//$('ul li div:nth-child(6)', this.$el).click($.proxy(this.removeTeam, this));
	},
	//generates callback functions for event binding
	//to the event change:teams:teamID
	teamCallbackFactory: function(teamID, context) {
		if (!context) {
			context = this;
		}
		return function() {
			var team = context.model.teamWithID(teamID),
				index;
			//get the index of the team
			context.teams.forEach(function(_team, _index) {
				if (team === _team) {
					index = _index;
					return;
				}
			});
			$('#teams ul li:nth-child('+(index+1).toString()+') div:nth-child(1)').text(team.name);
			$('#teams ul li:nth-child('+(index+1).toString()+') div:nth-child(2)').text('Wins: ' + team.WLT[0].toString());
			$('#teams ul li:nth-child('+(index+1).toString()+') div:nth-child(3)').text('Losses: ' + team.WLT[1].toString());
			$('#teams ul li:nth-child('+(index+1).toString()+') div:nth-child(4)').text('Ties: ' + team.WLT[2].toString());

		}
	},
	hide: function(callback) {
		if (this.isShowing) {
			this.isShowing = false;
			$('ul', this.$el).slideUp(400, callback);
		} else {
			callback();
		}
		
	},
	show: function(callback) {
		if (!this.isShowing) {
			this.isShowing = true;
			$('ul', this.$el).slideDown(400, callback);
		} else if (callback) {
			callback();
		}
		
	},
	toggle: function() {
		if (this.isShowing) {
			this.hide();
		} else {
			this.show();
		}
	},
	//takes the event that is being fired and
	//parses out the index of the li
	//that it is referring to
	getIndex: function(event) {
		if (BrowserDetect.browser === "Firefox") {
			
			return $(event.currentTarget).parent().index();
		}
		return $(event.toElement).parent().index();
	},
	editTeam: function(event) {
		
		var teamsEdit, index, team;
		if (!EditView.isEditting()) {

			teamsEdit = EditView.getInstance('teams');
			index = this.getIndex(event);
			
			team = this.teams[index];
			
			//set the variables of teams edit
			teamsEdit.name = team.name;

			teamsEdit.show();
			teamsEdit.on('submit', function() {

				this.setTeamAtIndex(index, {name: teamsEdit.name, WLT: team.WLT, teamID: team.teamID});
				
				teamsEdit.unbind('submit');
				teamsEdit.unbind('cancel');
			}.bind(this));

			teamsEdit.on('cancel', function() {

				teamsEdit.unbind('submit');
				teamsEdit.unbind('cancel');
			});
		}
			
	},
	generateTeamView: function(teamObj) {
		return ($('<li teamid="'+teamObj.teamID+'"></li>').append('<div>'+teamObj.name+'</div>')
							.append('<div>Wins: '+teamObj.WLT[0].toString()+'</div>')
							.append('<div>Losses: '+teamObj.WLT[1].toString()+'</div>')
							.append('<div>Ties: '+teamObj.WLT[2].toString()+'</div>')
							.append('<div>edit</div><div>delete</div><div>drop</div>'));
	},
	//fix this to make sure teamObj has the correct properties
	//the team that is being set should have the same id as the one
	//it is replacing, or an error is thrown
	setTeamAtIndex: function(index, teamObj) {
		var teamEl;
		if (teamObj.teamID !== this.teams[index].teamID) {
			throw new Error('The id of the the team being set is not the same as the team replacing it');
		} else {
			teamEl = $('ul li:nth-child('+(index+1)+')', this.$el);
			//this also changes the value in the model
			this.teams[index] = teamObj;
			

			//set the DOM element
			this.model.trigger('change:teams:'+teamObj.teamID);
		}
			

	},
	addTeam: function() {
			
		var defaultObj = {
				name: "New Team",
				WLT: [0,0,0]
			},
			team,
			index,
			teamsEdit = EditView.getInstance('teams');

		teamsEdit.name = defaultObj.name;
		teamsEdit.show();

		teamsEdit.on('submit', function() {
			defaultObj.name = teamsEdit.name;


			//pushing to the teams property	
			//also adds to the model because
			//the teams property is a direct
			//reference of the model, the add team
			//method returns the teamID
			//of the newly created team
			defaultObj.teamID = this.model.addTeam(defaultObj);

			teamID = defaultObj.teamID;

			$('#teams ul').append(this.generateTeamView(defaultObj));
			//bind events related to the newly created team
			
			this.model.on('change:teams:'+defaultObj.teamID.toString(), this.teamCallbackFactory(teamID, this));
			

			NQ.now({type: 'success', message: defaultObj.name + " was added as a new team"});
			teamsEdit.unbind('submit');
			teamsEdit.unbind('cancel');

		}.bind(this));

		teamsEdit.on('cancel', function() {
			teamsEdit.unbind('submit');
			teamsEdit.unbind('cancel');
		});
			
			

		this.show();
				

	},
	//removes team and removes the change:teams:teamID
	//event for the associated team
	removeTeamAtIndex: function(index) {
		var teamID = this.teams[index].teamID;
			self = this,
			listEl = $('ul li:nth-child('+ (index + 1).toString()+ ')', this.$el);

		listEl.slideUp(400, function() {
			listEl.remove();
			//triggers event teamRemoved
			self.model.deleteTeam(teamID);
			
		});
	},
	//confirms that a team is to be removed
	//and calls the removeTeam method if
	//there is a positive confirmation
	confirmRemoveTeam: function(event) {
		var confirm = new ConfirmationBox(
			{
				message: 'Are you sure you would like to delete this team',
				button1Name: 'YES',
				button2Name: 'NO'
			});

		confirm.show();
		confirm.on('clicked1', function() {

			this.removeTeamAtIndex(this.getIndex(event));

			confirm.unbind('clicked1');
			confirm.unbind('clicked2');
		}.bind(this));

		confirm.on('clicked2', function() {
			confirm.unbind('clicked1');
			confirm.unbind('clicked2');
		});
	},
	//uses the teams property of the object to set up the elements within the
	//teams list
	//removes all currently set teams and resets the teams displayed using the
	//teams property
	resetTeams: function() {
		var i, n, list = $('ul', this.$el);

		//remove the currently-existing elements from this list
		list.children().remove();
		for (i =0, n = this.teams.length; i < n; ++i) {
			list.append(this.generateTeamView(this.teams[i]));
		}
		if (!this.resetTeams.eventsSet) {
			this.model.get('teams').forEach(function(team) {
				var id = team.teamID;
				//cache the id in a local variable
				//these bind to teams at different indices, so if a team changes its index,
				//this needs to be reset as well
				this.model.on('change:teams:'+team.teamID.toString(), this.teamCallbackFactory(team.teamID, this));

			}.bind(this));
		}
			
		if (!this.resetTeams.eventsSet) {
			this.resetTeams.eventsSet = true;
		}
	},
	dropTeam: function(event) {
		var index = this.getIndex(event)
			el = $('#teams ul li').eq(index),
			self = this;

		self.teams[index].dropped = true;

		el.append('<div class="teamDropped">Dropped</div>');
		$('.teamDropped', el).click(function() {
			var listItemEl = $(this).parent(),
				confirmation = new ConfirmationBox(
					{
						message: 'Are you sure you would like to undrop this team?',
						button1Name: 'YES',
						button2Name: 'NO'
					});

			confirmation.show();

			confirmation.on('clicked1', function() {
				var i = listItemEl.index();
				self.teams[i].dropped = false;
				$('.teamDropped', listItemEl).remove();

				confirmation.unbind('clicked1');
				confirmation.unbind('clicked2');
			});

			confirmation.on('clicked2', function() {
				confirmation.unbind('clicked1');
				confirmation.unbind('clicked2');
			});
		});
	}
});

TeamsView.getInstance = function() {
	if (!TeamsView.instance) {
		TeamsView.instance = new TeamsView(sportModel);
	}
	return TeamsView.instance;
};


GamesView = Backbone.View.extend({
	el: '#games',
	isShowing: false,
	//the date string of the last game
	lastDate: '',
	games: [],
	events: {
		'click div:nth-child(1)': 'toggle',
		'click ul li div:nth-child(7)': 'editGame',
		'click ul li div:nth-child(8)': 'confirmRemoveGame',
		'click ul li div:nth-child(9)': 'cancelClicked',
		'click #addGame': 'addGame'
	},
	initialize: function(model) {
		
		this.model = model;
		//sort the games
		this.games = model.get('games');
		
		this.sortAndDisplay();

		//setting dynamic events and model-related events
		model.on('change:games', function() {

			this.games = model.get('games');
			this.sortAndDisplay();
		}.bind(this));


		model.get('teams').forEach(function(team) {
			var id = team.teamID;
			model.on('change:teams:'+team.teamID.toString(), function() {
				var team = model.teamWithID(id);
				console.log('change team was called by game for team: ' + team.teamID.toString());
				console.log('team name that is being changed: ' + $('#games ul li div:nth-child(3) span[teamid="'+team.teamID.toString()+'"]').text());
				console.log("Changing name to: " + team.name);
				$('#games ul li div:nth-child(4) span[teamid="'+team.teamID.toString()+'"]').text(team.name);
			});
		});
		
		model.on('teamAdded', function(event) {
			//teamID is a customized property that is 
			//bound to the event object through IMModel
			var id = event.teamID;
			model.on('change:teams:'+id.toString(), function() {
				var team = model.teamWithID(id);
				$('#games ul li div:nth-child(4) span[teamid="'+team.teamID.toString()+ '"]').text(team.name);
			});
		});

		model.on('teamRemoved', function(event) {
			//found games related to this team and remove them
			console.log('teamRemoved called on game for id ' + event.teamID);
			this.removeGamesWithTeam(event.teamID);
		}.bind(this));

	},
	
	//contains optional callbacks for after the 
	//show and hide methods have completed
	show: function(callback) {
		if (!this.isShowing) {
			$('ul', this.$el).slideDown(400, callback);
			this.isShowing = true;
		} else if (callback) {
			callback();
		}
			
	},
	hide: function(callback) {
		if (this.isShowing) {
			$('ul', this.$el).slideUp(400, callback);
			this.isShowing = false;
		} else {
			callback();
		}
			
	},
	toggle: function() {
		if (this.isShowing) {
			this.hide();
		} else {
			this.show();
		}
	},
	editGame: function(event) {
		var gamesEdit = EditView.getInstance('games'),
			index = this.getIndex(event),
			game = this.games[index],
			//cache properties of the original game
			winner = game.winner,
			team1_id = game.teams[0],
			team2_id = game.teams[1];

		gamesEdit.teams = this.model.get('teams');
		gamesEdit.homeTeam = game.teams[0];
		gamesEdit.awayTeam = game.teams[1];
		gamesEdit.homeScore = game.score[0];
		gamesEdit.awayScore = game.score[1];
		gamesEdit.startTime = game.startTime;
		gamesEdit.endTime = game.endTime;
		gamesEdit.date = game.date;
		gamesEdit.winner = game.winner;
		gamesEdit.location = game.location;


		gamesEdit.show();
		gamesEdit.on('submit', function() {

			var gameObj = {
				teams: [gamesEdit.homeTeam, gamesEdit.awayTeam],
				score: [gamesEdit.homeScore, gamesEdit.awayScore],
				location: gamesEdit.location,
				winner: gamesEdit.winner,
				startTime: gamesEdit.startTime,
				endTime: gamesEdit.endTime,
				date: gamesEdit.date,
				isCancelled: false
			};
			this.setGameAtIndex(index, gameObj);
			//change the WLT for the teams
			
			if (winner === 0 || winner === 4) {
				this.model.decrementWins(team1_id, {silent: true});
				this.model.decrementLosses(team2_id, {silent: true});
			} else if (winner === 1 || winner === 3) {
				this.model.decrementWins(team2_id, {silent: true});
				this.model.decrementLosses(team1_id, {silent: true});
			} else if (games.winner === 2) {
				this.model.decrementTies(team1_id, {silent: true});
				this.model.decrementTies(team2_id, {silent: true});
			}

			if (gamesEdit.winner === 0 || gamesEdit.winner === 4) {
				this.model.incrementWins(gamesEdit.homeTeam, {silent: true});
				this.model.incrementLosses(gamesEdit.awayTeam, {silent: true});

			} else if (gamesEdit.winner === 1 || gamesEdit.winner === 3) {
				this.model.incrementWins(gamesEdit.awayTeam, {silent: true});
				this.model.incrementLosses(gamesEdit.homeTeam, {silent: true});
			} else if (gamesEdit.winner === 2) {
				this.model.incrementTies(gamesEdit.homeTeam, {silent: true});
				this.model.incrementTies(gamesEdit.awayTeam, {silent: true});
			}

			//events here, custom events that are more specific
			if (team1_id !== gamesEdit.homeTeam) {
				
				this.model.trigger('change:teams:'+gamesEdit.homeTeam.toString());
			}
			this.model.trigger('change:teams:'+team1_id.toString());
			if (team2_id !== gamesEdit.awayTeam) {

				this.model.trigger('change:teams:'+gamesEdit.awayTeam.toString());
			}
			this.model.trigger('change:teams:'+team2_id.toString());

			gamesEdit.unbind('submit');
			gamesEdit.unbind('cancel');
		}.bind(this));

		gamesEdit.on('cancel', function() {

			gamesEdit.unbind('submit');
			gamesEdit.unbind('cancel');
		});
	},
	addGame: function() {
		var gameObj, teams = this.model.get('teams'), gamesEdit;
		//make sure there are atleast 2 teams before allowing a game to
		//be added
		if (teams.length >= 2) {
			
			
			gameObj = {
				date: DateHelper.dateStringFromDate(new Date()),
				startTime: '01:00am',
				endTime: '02:00am',
				teams: [teams[0].teamID, teams[1].teamID],
				score: [0,0],
				winner: 2,
				location: 'No location',
				isCancelled: false

			};

			gamesEdit = EditView.getInstance('games');
			gamesEdit.homeTeam = gameObj.teams[0];
			gamesEdit.awayTeam = gameObj.teams[1];
			gamesEdit.teams = this.model.get('teams');
			gamesEdit.date = gameObj.date;
			gamesEdit.homeScore = gameObj.score[0];
			gamesEdit.awayScore = gameObj.score[1];
			gamesEdit.winner = gameObj.winner;
			gamesEdit.location = gameObj.location;
			gamesEdit.startTime = gameObj.startTime;
			gamesEdit.endTime = gameObj.endTime;

			gamesEdit.show();

			gamesEdit.on('submit', function() {
				//events here, custom events that are more specific
				//trigger the correct events
					
				this.model.trigger('change:teams:'+gamesEdit.homeTeam.toString());
				this.model.trigger('change:teams:'+gamesEdit.awayTeam.toString());
			
				//set the values to what was submitted
				gameObj.teams[0] = gamesEdit.homeTeam;
				gameObj.teams[1] = gamesEdit.awayTeam;
				gameObj.date = gamesEdit.date;
				gameObj.score[0] = gamesEdit.homeScore;
				gameObj.score[1] = gamesEdit.awayScore;
				gameObj.winner = gamesEdit.winner;
				gameObj.location = gamesEdit.location;
				gameObj.startTime = gamesEdit.startTime;
				gameObj.endTime = gamesEdit.endTime;

				//insert the game
				this.insertGame(gameObj);

				//count the wins, ties, and losses that are incremented
				//with the addition of the game
				this.countWLTForGame(gameObj);
				this.show();

				NQ.now({type: 'success', message: "You have successfully created a new game"});
				gamesEdit.unbind('submit');
				gamesEdit.unbind('cancel');

			}.bind(this));

			gamesEdit.on('cancel', function() {
				gamesEdit.unbind('submit');
				gamesEdit.unbind('cancel');
			});

				
				
		} else {
			alert('You must have at least 2 registered teams before creating a game');
		}
			
	},
	//for changing the wins, ties, and losses
	//of a team by either counting or discounting a
	//game
	discountWLTForGame: function(game) {
		var team1_id = game.teams[0],
			team2_id = game.teams[1];

		if (this.model.teamExists(team1_id)) {
			if (game.winner === 0 || game.winner === 4) {
				this.model.decrementWins(team1_id, {silent: true});
			} else if (game.winner === 1 || game.winner === 3) {
				this.model.decrementLosses(team1_id, {silent: true});

			} else if (game.winner === 2) {
				this.model.decrementTies(team1_id, {silent: true});

			}
			this.model.trigger('change:teams:'+team1_id.toString());

		}
		if (this.model.teamExists(team2_id)) {

			if (game.winner === 0 || game.winner === 4) {
				this.model.decrementLosses(team2_id, {silent: true});
			} else if (game.winner === 1 || game.winner === 3) {
				this.model.decrementWins(team2_id, {silent: true});

			} else if (game.winner === 2) {
				this.model.decrementTies(team2_id, {silent: true});

			}
			this.model.trigger('change:teams:'+team2_id.toString());
		}
		
	},
	countWLTForGame: function(game) {
		var team1_id = game.teams[0],
			team2_id = game.teams[1];

		if (game.winner === 0 || game.winner === 4) {
			this.model.incrementWins(team1_id, {silent: true});
			this.model.incrementLosses(team2_id, {silent: true});
		} else if (game.winner === 1 || game.winner === 3) {
			this.model.incrementWins(team2_id, {silent: true});
			this.model.incrementLosses(team1_id, {silent: true});

		} else if (game.winner === 2) {
			this.model.incrementTies(team1_id, {silent: true});
			this.model.incrementTies(team2_id, {silent: true});
		}
		this.model.trigger('change:teams:'+team1_id.toString());
		this.model.trigger('change:teams:'+team2_id.toString());

	},
	cancelClicked: function(event) {
		var index = this.getIndex(event), self = this,
			el = $('#games ul li').eq(index);
		this.games[index].isCancelled = true;
		this.discountWLTForGame(this.games[index]);
		el.append('<div class="gameCancelled">Cancelled</div>');
		$('.gameCancelled', el).click(function() {
			var confirmation = new ConfirmationBox(
				{
					message: 'Are you sure you would like to uncancel this game',
					button1Name: 'YES',
					button2Name: 'NO'
				}),
				cachedEl = el;

			confirmation.show();
			confirmation.on('clicked1', function() {
				var index = cachedEl.index();
				$('.gameCancelled', cachedEl).remove();
				confirmation.unbind('clicked1');
				confirmation.unbind('clicked2');
				//need to fix this to not search by index
				//index could have changed since the game
				//was cancelled
				self.games[index].isCancelled = false;
				self.countWLTForGame(self.games[index]);
			});
			confirmation.on('clicked2', function() {
				confirmation.unbind('clicked1');
				confirmation.unbind('clicked2');
			});
		});
	},
	//remove any game that has a team with the id
	//unlike removeGame, this method does
	//confirm if the deletion of the games
	//is desired
	removeGamesWithTeam: function(teamID) {
		var gamesToRemove = $('#games span[teamid="'+teamID.toString()+'"]').parent().parent(),
			indexes = [], i, n, model = this.model;

		//get the indexes of the games that are
		//to be deleted from the model
		this.games.forEach(function(game, index) {
			//in case the person set the same team
			//to compete with itself
			if (game.teams[0] === teamID || game.teams[1] === teamID) {

				indexes.push(index);

			}
		});

		//remove the games at the indexes that were found
		for (i =0, n = indexes.length; i < n; ++i) {

			//must decrement the index by the number
			//of games that were previously deleted so that the index
			//is always accurate as the array changes
			this.removeGameAtIndex(indexes[i] - i);
		}

		gamesToRemove.remove();
	},
	//removes the game at the given index within
	//the games array
	removeGameAtIndex: function(index, options) {
		var team1_id = this.games[index].teams[0],
			team2_id = this.games[index].teams[1],
			winner = this.games[index].winner,
			animate = (!options || options.animate) ? true : false;
			

		this.discountWLTForGame(this.games[index]);

		this.games.splice(index, 1);
		if (animate) {
			$("#games ul li:nth-child("+(index+1).toString()+")").slideUp(400, function() {
				$(this).remove();
			});
		} else {
			$("#games ul li:nth-child("+(index+1).toString()+")").remove();
		}
			
	},
	//an abstraction over the remove game at index that
	//first confirms if the user wants to remove the game
	//then converts the event to an index of an array that can
	//be used to idenitify the game within the model
	confirmRemoveGame: function(event) {
		var index = this.getIndex(event),
			confirmation = new ConfirmationBox({
				message: "Are you sure you would like to delete this element?",
				button1Name: 'YES',
				button2Name: 'NO'		
			});

		confirmation.on('clicked1', function() {
			this.removeGameAtIndex(index);

			confirmation.unbind('clicked1');
			confirmation.unbind('clicked2');
		}.bind(this));

		confirmation.on('clicked2', function() {
			confirmation.unbind('clicked1');
			confirmation.unbind('clicked2');
		});

		confirmation.show();

			
	},
	getIndex: function(event) {
		if (BrowserDetect.browser === "Firefox") {
			
			return $(event.currentTarget).parent().index();
		}
		return $(event.toElement).parent().index();
	},
	//sets the model, property and the rendered data
	//changes the game at the index to the new game object
	setGameAtIndex: function(index, gameObj) {
		//NOTE: removing before insertion creates a wierd bug
		var dateChanged = this.games[index].date !== gameObj.date || this.games[index].startTime !== gameObj.startTime,
			game = this.games[index];

		//put the game in the correct location, incase the date changed
		if (dateChanged) {
			
			//remove the old html element
			this.insertGame(gameObj);
			
			//the index will be incremented after insertion
			if (this.gameValue(gameObj) < this.gameValue(game)) {
				
				index++;
			}
			this.games.splice(index, 1);
			$('ul li:nth-child('+(index+1).toString() + ')', this.$el).remove();

			

		} else {
			//just put the game back into the same slot that it was in
			//no need to reset the game numbers
			this.games.splice(index, 1, gameObj);
			$('ul li:nth-child('+(index+1).toString() + ')', this.$el).after(this.generateGameView(gameObj, index+1)).remove();

		}
		
	},
	//inserts a game into the correct chronological spot
	//adds game to the model and to the property
	//has an options to change the value in the model,
	//if no value is passed in as a second parameter,
	//the model is changed.  The insertion process does
	//not call any events, events should be called explicitly if desired
	insertGame: function(gameObj) {
		var insertIndex,
			//cache the length because it changes before some code can
			//get called in this method
			length = this.games.length,
			selector;
		this.games.forEach(function(game, index) {

			if (this.gameValue(gameObj) < this.gameValue(game) && insertIndex === undefined) {
				insertIndex = index;
			}
		}.bind(this));
		//this is the case if the game is after all of the 
		//current elements
		if (insertIndex === undefined) {
			insertIndex = this.games.length;
		}
		
		//render addition
		if (insertIndex === length) {
			
			this.games.push(gameObj);
			$('ul', this.$el).append(this.generateGameView(gameObj, insertIndex + 1));
			this.resetGameNumbers(insertIndex);
			
		} else {
			
			$('li:nth-child(' + (insertIndex+1).toString() + ')', this.$el).before(this.generateGameView(gameObj, insertIndex + 1));
			this.resetGameNumbers(insertIndex);	
			this.games.splice(insertIndex, 0, gameObj);
		}
		
	},
	generateGameView: function(game, gameNumber) {
		var homeTeam = this.model.teamWithID(game.teams[0]),
			awayTeam = this.model.teamWithID(game.teams[1]),
			homeScore,
			awayScore
			backgroundColor = (game.winner === 5) ? 'background-color: red;' : 'background-color: black;';

			if (game.winner === 3) {
				homeScore = "F";
				awayScore = "W";
			} else if (game.winner === 4) {
				homeScore = "W";
				awayScore = "F";
			} else {
				homeScore = game.score[0].toString();
				awayScore = game.score[1].toString();
			}

			el =  $('<li></li>').append('<div style="'+backgroundColor+'">'+gameNumber.toString()+'</div>')
								.append('<div>'+game.date+'</div>')
								.append('<div>'+game.startTime+ ' - '+ game.endTime+'</div>')
								.append('<div><span teamid="'+game.teams[0].toString()+'">'+homeTeam.name+'</span>Vs<span teamid="'+game.teams[1].toString()+'">'+awayTeam.name+'</span></div>')
								.append('<div>'+game.location+'</div>')
								.append('<div>'+homeScore+'-'+awayScore+'</div>')
								.append('<div>edit</div>')
								.append('<div>delete</div><div>cancel</div>');
		return el;
	},
	//returns the value of the game that
	//is used to sort the games in the correct
	//order by ascending game values
	gameValue: function(gameObj) {
		var time = DateHelper.dateFromDateString(gameObj.date).getTime();
			time = time + (DateHelper.timeStringInSecs(gameObj.startTime) * 1000);

			return time;
			
	},
	//sorts the games a
	sortAndDisplay: function() {
		var listEl = $('ul', this.$el),
			teamsView = TeamsView.getInstance(),
			team;

		listEl.children().remove();

		this.model.sortGames(true);
		//set the pointer back
		this.games = this.model.get('games');
		this.games.forEach(function(game, index) {
			
			this.generateGameView(game, index+1).appendTo(listEl);
		}.bind(this));

	},
	resetGameNumbers: function(startIndex) {
		if (startIndex === undefined) {
			$('#games ul li').toArray().forEach(function(game, index) {
				$(game).children('div:nth-child(1)').text((index+1).toString());
			});
		} else {
			$('#games ul li:gt('+(startIndex-1).toString()+')').toArray().forEach(function(game, index) {
				$(game).children('div:nth-child(1)').text((index+1+startIndex).toString());
			});
		}
			
	}
});

GamesView.getInstance = function() {
	if (!GamesView.instance) {
		GamesView.instance = new GamesView(sportModel);
	}
	return GamesView.instance;
};
//edit view contains all the windows that have
//access to editting the data within the model
//each window has a singleton that can be accessed through
//this method
EditView = (function() {
	//indicates if any of the windows are active
	var isEditting = false,

		NameEdit = Backbone.View.extend({

			el: '#nameEdit',
			isShowing: false,
			sportName: '',
			events: {
				'click input[value="submit"][type="button"]': 'onSubmit',
				'click input[value="cancel"][type="button"]': 'onCancel',
				'blur input[type="text"]': 'setName'
			},
			show: function() {
				if (!isEditting) {

					$('input:nth-of-type(1)', this.$el).val(this.sportName);
				 
					this.$el.show();
					this.isShowing = true;
					isEditting = true;
				}
				
			},
			hide: function() {
				this.isShowing = false;
				isEditting = false;
				this.$el.hide();
			},
			onSubmit: function() {
				this.trigger('submit');
				
				this.hide();
			},
			onCancel: function() {
				this.trigger('cancel');
				this.hide();
			},
			setName: function() {
				this.sportName = $('input[type="text"]', this.$el).val();
			}
		}),

		SeasonEdit = Backbone.View.extend({
			el: '#seasonEdit',
			isShowing: false,
			season: 0,
			events: {
				'click input[type="button"][value="submit"]': 'onSubmit',
				'click input[type="button"][value="cancel"]': 'onCancel',
				'change select': 'setSeason'
			},
			show: function() {
				$('#seasonEdit select').val(this.season.toString());
				this.setSeason();
				if (!this.isShowing) {
					this.$el.show();
					this.isShowing = true;
				}
			},
			hide: function() {
				if (this.isShowing) {
					this.isShowing = false;
					this.$el.hide();
				}
			},
			onSubmit: function() {
				this.trigger('submit');
				this.hide();
			},
			onCancel: function() {
				this.trigger('cancel');
				this.hide();
			},
			//called when the select value changes
			setSeason: function() {
				this.season = +$('#seasonEdit select').val();

			}
		}),

		DatesEdit = Backbone.View.extend({
			el: '#datesEdit',
			isShowing: false,
			startDate: '',
			endDate: '',
			_start: {
				month: $('div:nth-child(2) select:nth-child(2)', this.$el),
				day: $('div:nth-child(2) select:nth-child(3)', this.$el),
				year: $('div:nth-child(2) select:nth-child(4)', this.$el)
			},
			_end: {
				month: $('div:nth-child(3) select:nth-child(2)', this.$el),
				day: $('div:nth-child(3) select:nth-child(3)', this.$el),
				year: $('div:nth-child(3) select:nth-child(4)', this.$el)
			},
			events: {
				'click input:nth-child(4)': 'onSubmit',
				'click input:nth-child(5)': 'onCancel',
				//listen for changes to the start date
				'change div:nth-child(2) select': 'startChanged',
				//listen for changes to the end date
				'change div:nth-child(3) select': 'endChanged'
				
			},
			show: function() {
				if (!isEditting) {
					this.setStartDateTag();
					this.setEndDateTag();
					this.$el.show();
					this.isShowing = true;
					isEditting = true;
				}
					
			},
			hide: function() {
				this.$el.hide();
				this.isShowing = false;
				isEditting = false;
			},
			onSubmit: function() {
				this.trigger('submit');
				this.hide();
			},
			onCancel: function() {
				this.trigger('cancel');
				this.hide();
			},
			//uses the start and end date properties
			//to create the tags for the start and end dates
			setStartDateTag: function() {
				var startDate, startDays, i, n;

				if (this.startDate === '' ) {
					throw new Error("the start date is not set correctly within the e_datesEdit");
				}

				startDate = this.startDate.split('/');
				startDays = DateHelper.daysForMonth(+startDate[0] - 1, +startDate[2]);
				//remove all currently existing options

				this._start.day.children().remove();

				//fix the options of the start and end days
				for (i=1, n = startDays; i <= n; ++i) {
					if (i <= 9) {

						this._start.day.append('<option value="0' + i + '">' + i + '</option>');
					} else {
						this._start.day.append('<option value="' + i + '">' + i + '</option>');
					}
					
				}

				this._start.month.val(startDate[0]);
				this._start.day.val(startDate[1]);
				this._start.year.val(startDate[2]);
				
			},
			setEndDateTag: function() {
				var endDate, startDays, endDays, i, n;

				if (this.endDate === '' ) {
					throw new Error("the end date is not set correctly within the e_datesEdit");
				}

				endDate = this.endDate.split('/');
				endDays = DateHelper.daysForMonth(+endDate[0] - 1, +endDate[2]);
				//remove all currently existing options

				this._end.day.children().remove();

				for (i=1, n = endDays; i <= n; ++i) {
					if (i <= 9) {

						this._end.day.append('<option value="0' + i + '">' + i + '</option>');
					} else {
						this._end.day.append('<option value="' + i + '">' + i + '</option>');
					}
					
				}

				this._end.month.val(endDate[0]);
				this._end.day.val(endDate[1]);
				this._end.year.val(endDate[2]);
			},
			startChanged: function() {
				var startDate = this.startDate.split('/'),
					month = +this._start.month.val(), 
					year = +this._start.year.val(), 
					days = +this._start.day.val(), 
					changed = false;

				while (days > DateHelper.daysForMonth(month - 1, year)) {
					days--;
					changed = true;
				}

				if (days <= 9) {
					startDate[1] = '0' + days.toString();
				} else {
					startDate[1] = days.toString();
				}
				
				//set the month
				if (month <= 9) {
					startDate[0] = '0' + month.toString();
				} else {
					startDate[0] = month.toString();
				}
				//set the year
				startDate[2] = year.toString();

				this.startDate = startDate[0] + '/' + startDate[1] + '/' + startDate[2];
				this.setStartDateTag();

			},
			endChanged: function() {
				var endDate = this.endDate.split('/'),
					month = +this._end.month.val(), 
					year = +this._end.year.val(), 
					days = +this._end.day.val(), 
					changed = false;

				while (days > DateHelper.daysForMonth(month - 1, year)) {
					days--;
					changed = true;
				}

				if (days <= 9) {
					endDate[1] = '0' + days.toString();
				} else {
					endDate[1] = days.toString();
				}
				
				//set the month
				if (month <= 9) {
					endDate[0] = '0' + month.toString();
				} else {
					endDate[0] = month.toString();
				}
				//set the year
				endDate[2] = year.toString();

				this.endDate = endDate[0] + '/' + endDate[1] + '/' + endDate[2];
				this.setEndDateTag();
			}
		}),

		TeamsEdit = Backbone.View.extend({
			'el': '#teamsEdit',
			name: '',
			isShowing: false,
			events: {
				'click input[value="submit"][type="button"]': 'onSubmit',
				'click input[value="cancel"][type="button"]': 'onCancel',
				'blur input:nth-child(2)': 'updateName'
			},
			onSubmit: function() {
				this.trigger('submit');

				this.hide();
			},
			onCancel: function() {
				this.trigger('cancel');
				this.hide();
			},
			updateName: function() {
				var name = $('input:nth-child(2)', this.$el).val();
				if (name === "") {
					name = this.name;
					$('input:nth-child(2)', this.$el).val(name);
				} else {
					this.name = name;
				}
				
			},
			show: function() {
				if (!isEditting) {
					$('input:nth-child(2)', this.$el).val(this.name);
					
					this.$el.show();
					this.isShowing = true;
					isEditting = true;
				}
					
			},
			hide: function() {
				this.$el.hide();
				this.isShowing = false;
				isEditting = false;
			}
		}),

		GamesEdit = Backbone.View.extend({
			'el': '#gamesEdit',
			//here are the default values if they were
			//not set prior to submission
			isShowing: false,
			//keeps track of the team id of
			//the selected teams
			homeTeam: 0,
			awayTeam: 0,
			//this is the teams property from the model
			//this property will not be changed by this object,
			//but is used to for displaying the possible teams to
			//select from
			teams: [],
			homeScore: 0,
			awayScore: 0,
			winner: 0,
			date: '01/01/2013',
			startTime: '01:00am',
			endTime: '02:00am',
			location: 'Court 1',
			events: {
				'change div:nth-child(2) select': 'dateChanged',
				'change div:nth-child(3) select': 'startTimeChanged',
				'change div:nth-child(4) select': 'endTimeChanged',
				'click input[value="submit"][type="button"]': 'onSubmit',
				'click input[value="cancel"][type="button"]': 'onCancel',
				'change div:nth-child(5) select': 'homeTeamChanged',
				'change div:nth-child(6) select': 'awayTeamChanged',
				'blur div:nth-child(7) input:nth-child(1)': 'homeScoreChanged',
				'blur div:nth-child(7) input:nth-child(2)': 'awayScoreChanged',
				'blur div:nth-child(8) input': 'locationChanged',
				'change input[type="radio"][name="winner"]': 'winnerChanged'

			},
			show: function() {
				var homeSelect, awaySelect;
				if (!isEditting) {

					homeSelect = $('div:nth-child(5) select', this.$el);
					awaySelect = $('div:nth-child(6) select', this.$el);

					//set the options for the select teams
					homeSelect.children().remove();

					awaySelect.children().remove();

					this.teams.forEach(function(teamObj) {
						$('<option value="'+teamObj.teamID.toString()+'">'+teamObj.name+'</option>')
							.appendTo(homeSelect);
						$('<option value="'+teamObj.teamID.toString()+'">'+teamObj.name+'</option>')
							.appendTo(awaySelect);

					}.bind(this));
					//select teams

					homeSelect.val(this.homeTeam.toString());
					awaySelect.val(this.awayTeam.toString());
					//should create setter methods instead
					//of using these here
					this.setDateTag();

					//startTime
					this.setStartTime(this.startTime);

					//endTime
					this.setEndTime(this.endTime);
					
					$('div:nth-child(8) input', this.$el).val(this.location);

					//set the winner
					$('#gamesEdit input[type="radio"][name="winner"][value="'+this.winner.toString()+ '"]').prop('checked', true);

					this.isShowing = true;
					this.$el.show(); 
					isEditting = true;
				}
					

			},
			hide: function() {this.$el.hide(); this.isShowing = false; isEditting = false;},
			onSubmit: function() {this.trigger('submit'); this.hide();},
			onCancel: function() {this.trigger('cancel'); this.hide();},

			dateChanged: function() {
				
				var date = this.date.split('/'),
					monthEl = $('div:nth-child(2) select:nth-child(2)', this.$el),
					dayEl = $('div:nth-child(2) select:nth-child(3)', this.$el),
					yearEl = $('div:nth-child(2) select:nth-child(4)', this.$el),
					 month = +monthEl.val(), 
					year = +yearEl.val(), 
					days = +dayEl.val();

				while (days > DateHelper.daysForMonth(month - 1, year)) {
					days--;
				}

				if (days <= 9) {
					date[1] = '0' + days.toString();
				} else {
					date[1] = days.toString();
				}
				
				//set the month
				if (month <= 9) {
					date[0] = '0' + month.toString();
				} else {
					date[0] = month.toString();
				}
				//set the year
				date[2] = year.toString();

				this.date = date[0] + '/' + date[1] + '/' + date[2];
				
				this.setDateTag();
				
			},
			setStartTime: function(timeString) {
				var startTime = DateHelper.splitTime(timeString, false);
				this.startTime = timeString;
				$('div:nth-child(3) select:nth-child(2)', this.$el).val(startTime[0]);
				$('div:nth-child(3) select:nth-child(3)', this.$el).val(startTime[1]);
				$('div:nth-child(3) select:nth-child(4)', this.$el).val(startTime[2]);
			},
			setEndTime: function(timeString) {
				var endTime = DateHelper.splitTime(timeString, false);
				this.endTime = timeString;

				$('div:nth-child(4) select:nth-child(2)', this.$el).val(endTime[0]);
				$('div:nth-child(4) select:nth-child(3)', this.$el).val(endTime[1]);
				$('div:nth-child(4) select:nth-child(4)', this.$el).val(endTime[2]);
			},
			setDateTag: function() {
				var date, days, dayEl = $('div:nth-child(2) select:nth-child(3)', this.$el), i, n;

				if (this.date === '' ) {
					throw new Error("the start date is not set correctly within the e_datesEdit");
				}

				date = this.date.split('/');
				days = DateHelper.daysForMonth(+date[0] - 1, + date[2]);

				//make the scores readonly if the game date is before 
				//the current date
				if (DateHelper.dateFromDateString(this.date).getTime() > Date.now()) {
					$('div:nth-child(7) input').val("");
					//make the score setter uneditable
					$('div:nth-child(7) input', this.$el).attr('readonly', true);
					//select the game not played button and disable other
					//radio buttons
					$('input[type="radio"][name="winner"][value="5"]').prop('checked', true);
					this.winner = 5;
					$('input[type="radio"][name="winner"]:not([value="5"])').attr('onclick', 'return false;');

				} else {
					//make the score setter editable
					$('div:nth-child(7) input', this.$el).attr('readonly', false);
					//make other radio buttons selectable
					$('input[type="radio"][name="winner"]:not([value="5"])').attr('onclick', false);

					//re-insert the home scores into the text fields
					$('div:nth-child(7) input:nth-child(1)').val(this.homeScore.toString());
					$('div:nth-child(7) input:nth-child(2)').val(this.awayScore.toString());
				}

				//remove all currently existing options

				dayEl.children().remove();

				//fix the options of the start and end days
				for (i=1, n = days; i <= n; ++i) {
					if (i <= 9) {

						dayEl.append('<option value="0' + i + '">' + i + '</option>');
					} else {
						dayEl.append('<option value="' + i + '">' + i + '</option>');
					}
					
				}

				$('div:nth-child(2) select:nth-child(2)', this.$el).val(date[0]);
				dayEl.val(date[1]);
				$('div:nth-child(2) select:nth-child(4)', this.$el).val(date[2]);
				
			},
			//check to make sure that the end time is
			// after the start time
			startTimeChanged: function() {
				var startTime, endTime, endTimeString = "";
				this.startTime = 	$('div:nth-child(3) select:nth-child(2)', this.$el).val() + ':' +
									$('div:nth-child(3) select:nth-child(3)', this.$el).val() +
									$('div:nth-child(3) select:nth-child(4)', this.$el).val();
				//only do this when the start time changes, and not when the end date changes
				//to avoid being too annoying
				if (DateHelper.timeStringInSecs(this.startTime) > DateHelper.timeStringInSecs(this.endTime)) {
					//change the end date
					startTime = DateHelper.splitTime(this.startTime, true);
					endTime = DateHelper.splitTime(this.endTime, true);
					endTime[0] = startTime[0] + 1;
					endTime[1] = startTime[1];
					endTime[2] = startTime[2];
					if (endTime[0] === 13) {
						endTime[0] = 1;
						if (endTime[2] === 'am') {
							endTime[2] = 'pm';
						} else if (endTime[2] === 'pm') {
							endTime[2] = 'am';
						}
					}
					if (endTime[0] <= 9) {
						endTimeString = endTimeString + '0' + endTime[0].toString() + ':';
					} else {
						endTimeString = endTimeString + endTime[0].toString() + ':';
					}

					if (endTime[1] <= 9) {
						endTimeString = endTimeString + '0' + endTime[1].toString();
					} else {
						endTimeString = endTimeString + endTime[1].toString();
					}

					endTimeString = endTimeString + endTime[2];

					this.setEndTime(endTimeString);
				}
			},					
			//check to make sure that the end time is
			//after the start time
			endTimeChanged: function() {

				this.endTime = 	$('div:nth-child(4) select:nth-child(2)', this.$el).val() + ':' +
								$('div:nth-child(4) select:nth-child(3)', this.$el).val() +
								$('div:nth-child(4) select:nth-child(4)', this.$el).val();
			},
			homeTeamChanged: function() {this.homeTeam = +$('div:nth-child(5) select', this.$el).val();},
			awayTeamChanged: function() {this.awayTeam = +$('div:nth-child(6) select', this.$el).val();},
			homeScoreChanged: function() {
				var scoreEl = $('div:nth-child(7) input:nth-child(1)', this.$el);
				if (this.validateHomeScore()) {
					this.homeScore = +scoreEl.val();
				} else {
					this.homeScore = 0;
					scoreEl.val("0");
				}
			},
			awayScoreChanged: function() {

				var scoreEl = $('div:nth-child(7) input:nth-child(2)', this.$el);
				if (this.validateAwayScore()) {
					this.awayScore = +scoreEl.val();
				} else {
					this.awayScore = 0;
					scoreEl.val("0");
				}
			},
			locationChanged: function() {
				this.location = $('div:nth-child(8) input', this.$el).val();
			},
			winnerChanged: function() {
				//if the date of the game is after the current date, then the 
				//game cannot have been played
				if (DateHelper.dateFromDateString(this.date).getTime() > Date.now()) {
					this.winner = 5;
				} else {
					this.winner = +$('[type="radio"][name="winner"]:checked', this.$el).val();
				}
					
			},
			//check to see if the home and away scores are
			//numbers
			validateHomeScore: function() {
				var score = $('div:nth-child(7) input:nth-child(1)', this.$el).val();
				return +score === +score;
			},
			validateAwayScore: function() {
				var score = $('div:nth-child(7) input:nth-child(2)', this.$el).val();
				return +score === +score;
			}
		});


	return {
		//singleton
		getInstance: function(elName) {
			var name = elName.toLowerCase();
			switch(elName) {
				case 'name':
					if (!NameEdit.instance) {
						NameEdit.instance = new NameEdit();
					}
					return NameEdit.instance;
				case 'season':
					if (!SeasonEdit.instance) {
						SeasonEdit.instance = new SeasonEdit();
					}
					return SeasonEdit.instance;
				case 'dates':
					if (!DatesEdit.instance) {
						DatesEdit.instance = new DatesEdit();
					}
					return DatesEdit.instance;
				case 'teams':
					if (!TeamsEdit.instance) {
						TeamsEdit.instance = new TeamsEdit();
					}
					return TeamsEdit.instance;
				case 'games':
					if (!GamesEdit.instance) {
						GamesEdit.instance = new GamesEdit();
					}
					return GamesEdit.instance;
				default: 
					//error
					throw new Error("Edit view could not find instance with name " + elName);
					break;
			}
		},
		isEditting: function() {
			
			return isEditting;
		}
	};

})();


//this method should be called after sportModel has been set
function setupViews() {
	nameView = NameView.getInstance();
	seasonView = SeasonView.getInstance();
	entryDatesView = E_DatesView.getInstance();
	seasonDatesView = S_DatesView.getInstance();
	teamsView = TeamsView.getInstance();
	gamesView = GamesView.getInstance();
};

//Script starts here
//need to make the fetch method more efficient so that
//it grabs only a single model instead of loading all 
//intramural sports
if (getQueryString('id').length) {
	//move the id query string to the sessionStorage property
	sessionStorage.id = getQueryString('id')[0];
}

if (sessionStorage.id !== 'null') {
	IMModel.getCollection().fetch();

} else {
	sportModel = new IMModel.Sport(JSON.parse(sessionStorage.model));
	setupViews();
}

IMModel.getCollection().on('sync', function() {
	var collection = IMModel.getCollection(),
		id = sessionStorage.id;
	
	sportModel = collection.get(id);
	setupViews();
});	


//set up loose functions and events here
$('#saveModel').click(function() {
	if (sportModel.isNew()) {
		console.log("Saving new model");
		sportModel.save(null, {
			success: function(models, response) {
				//assign the sport model a new id
				//and cache the id in the session
				console.log("Success");
				sessionStorage.id = response[0]._id;
				sportModel.set('_id', response[0]._id);
				NQ.now({type: 'success', message: "You have created a new intramurals sport!"});

			},
			error: function() {
				NQ.now({type: 'error', message: "I'm sorry.  "+sportModel.get('sport') + " could not be saved at this time"});
			}
		});
	} else {
		sportModel.save(null, {
			success: function() {
				NQ.now({type: 'success', message: "You have saved you're progress"});
			},
			error: function() {
				NQ.now({type: 'error', message: "I'm sorry.  "+sportModel.get('sport') + " could not be saved at this time"});
			}
		});
	}
	

}.bind(this));

$('#generateHTML').click(function() {
	window.location = "/intramurals/download?id=" + sportModel.id;
});

$('#delete').click(function() {
	var confirmation = new ConfirmationBox({
		message: "Are you sure you would like to delete " + sportModel.get('sport'),
		button1Name: 'YES',
		button2Name: 'NO'
	});

	confirmation.show();
	confirmation.on('clicked1', function() {
		sportModel.destroy({
			headers: {_id: sportModel.id},
			success: function() {
				var url = location.href
				url = url.substr(0, url.length - 8);
				console.log(url);
				//remove the intramurals extension from the url
				location.href = url;

			},
			error: function() {
				toastr.error('There was an error when trying to delete this sport');
			}
		});
		confirmation.unbind('clicked1');
		confirmation.unbind('clicked2');
	});
	confirmation.on('clicked2', function() {
		confirmation.unbind('clicked1');
		confirmation.unbind('clicked2');
	});
	
});


if (getQueryString('errors').length !== 0) {
	errors = decodeURIComponent(getQueryString('errors')[0]).split(',');
	NQ.add.apply(NQ, errors.map(function(error) {
		return {type: 'error', message: error};
	}));
	NQ.add({type: 'info', message: 'You can view all the errors by scrolling down and clicking on the errors button'});
	setupErrorsDisplay(errors);
}
NQ.add(
	{type: 'info', message: "Don't forget to save your progress!"},
	{type: 'info', message: "Scroll down to the bottom of the page to view the save button"});

NQ.start();
