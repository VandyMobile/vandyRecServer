var jsdom = require('jsdom');
	//array of data with all the sports 
	//that were uploaded in the single document
	sports = [],
	_ = require('underscore')._,
	DateHelper = require('./public/javascripts/DateHelper');

JSON.stringify(DateHelper);
//add missing helper methods to _

_.extendDeep = function(object) {
	var property, copy;
	if (Array.isArray(object)) {
		copy = object.slice();
		for (property in object) {
			if (object.hasOwnProperty(property) && +property !== +property) {
				//the property is not a number/index
				//the property belongs to the prototype
				if (typeof object[property] === 'object') {
					copy[property] = _.extendDeep(object[property]);
				} else {
					copy[property] = object[property];
				}
			}
		}
	} else {
		copy = {};
		for (property in object) {
			if (object.hasOwnProperty(property)) {
				if (typeof object[property] === 'object') {
					copy[property] = _.extendDeep(object[property]);
				} 
				else {
					copy[property] = object[property];
				}
			}
		}
	}
		
	return copy;
};
//sample object in sports

//helper functions for parsing 
//sports

//removes new line characters and replaces them with a single space
function removeNewLine(text) {
	var i, n, returnText = text;
	for (i = 0, n = text.length; i < n; ++i) {
		if (text.charAt(i) === '\n') {
			console.log("In here");
			returnText = returnText.substr(0,i) + " " + returnText.substr(i + 1, n - i - 1);
 		}
	}
	return returnText;
}

//removes spaces if the there are 
//multiple adjacent spaces
function trimExtraSpaces(text) {
	var i, n, returnText = "", precedingSpace = false;

	for (i = 0, n = text.length; i < n; ++i) {
		if (text.charAt(i).match(/\s/)) {
			if (!precedingSpace) {
				returnText = returnText + " ";
				precedingSpace = true;
			}
		} else {
			
			returnText = returnText + text.charAt(i);
			precedingSpace = false;
		}
	}

	return returnText;
}

function filterBadCharacters(text) {
	var i, n, returnText = "";
	for (i=0, n = text.length; i < n; ++i) {
		if (text.charAt(i).match(/[a-z,0-9, ,',:]/i)) {
			returnText = returnText + text.charAt(i);
		}
	}
	return returnText;
}

function tallyToNumber(window, element) {
	console.log("in tally");
	var total = 0;
	if (element.text() === "") {
		return 0;
	} else {
		
		total += (element.children('del').length * 5);
		if (element.text().match(/I/g)) {
			total += (element.text().match(/I/g).length - (element.children('del').length * 4));
		}
		
		return total;
	}
	
	
}

//for parsing ambiguous dates to a solution
function parseDate(date) {

}

//functions to parse out data
function sportName(window) {
	var nameEl = window.$('body p:nth-of-type(1)'),
		name = nameEl.text();
	return name;
}

function matrixOfTeams(window) {
	
	var teamsTable = window.$('body table:nth-of-type(1) tbody'), rowEl,
	    teams = [], i, j, m, n, nextTeam;
	for (i = 1, n = teamsTable.children().length; i < n; ++i) {
		
		nextTeam = {};
		nextTeam.WLT = new Array(3);
		nextTeam.teamID = i;
		for (j = 1, rowEl = teamsTable.children().eq(i), m = rowEl.children().length; j < m; ++j) {
			
			if (j >= 2) {
				nextTeam.WLT[j-2] = tallyToNumber(window, rowEl.children().eq(j));
			} else {
				nextTeam.name = filterBadCharacters(trimExtraSpaces(rowEl.children().eq(j).text().trim()));
			}
			
		}
		
		teams.push(_.extendDeep(nextTeam));
		console.log(JSON.stringify(nextTeam));
	}
	
	return teams;
}

function matrixOfGames(window) {
	var gamesTable = window.$('body table:nth-of-type(2) tbody'),
		i, n, j, m, gameEl, games = [], score = []
		location = gamesTable.children().eq(0).children().eq(2).text() + " ";

	for (i = 1, n = gamesTable.children().length; i < n; ++i) {
		gameEl = gamesTable.children().eq(i);
		nextGame = {};
		nextGame.teams = [];
		for (j = 0, m = gameEl.children().length; j < m; ++j) {
			switch(j) {
				case 0:
					nextGame.date = filterBadCharacters(trimExtraSpaces(gameEl.children().eq(0).text()).trim());
					break;
				case 1:
					nextGame.startTime = filterBadCharacters(trimExtraSpaces(gameEl.children().eq(1).text()).trim());
					break;
				case 2:
					nextGame.location = filterBadCharacters(trimExtraSpaces(location + gameEl.children().eq(2).text()).trim());
					break;
				case 3:
					nextGame.teams[0] = filterBadCharacters(trimExtraSpaces(gameEl.children().eq(3).text()).trim());
					break;
				case 5:
					nextGame.teams[1] = filterBadCharacters(trimExtraSpaces(gameEl.children().eq(5).text()).trim());
					break;
				case 6:
				
					score = gameEl.children().eq(6).text().split('-');
					
					if (score.length === 2) {

						score[0] = trimExtraSpaces(score[0]).trim();
						score[1] = trimExtraSpaces(score[1]).trim();

						nextGame.score = [0,0];
						//console.log(score);
						//console.log(+score[0]);
						
						if (+score[0] !== +score[0]) {
							//not a number
							//only need to set this using the data from the first score
				
							nextGame.forfeit = true;


						} else {
							nextGame.forfeit = false;
							nextGame.score[0] = +score[0];
						}

						if (+score[1] !== +score[1]) {
							//not a number
							
						} else {
							nextGame.score[1] = +score[1];
						}

						//set the winner
						
						if (+score[0] !== +score[0]) {
							
							
							if (score[0].toLowerCase() === 'w') {
								nextGame.winner = 0;
							} else {
								nextGame.winner = 1;
							}
						} else {
							if (nextGame.score[0] > nextGame.score[1]) {
								nextGame.winner = 0;
							} else if (nextGame.score[0] < nextGame.score[1]) {
								nextGame.winner = 1;
							} else {
								nextGame.winner = 2;
							}
						}

					} else {
						//the game cannot be read
						nextGame.score = [0,0];
					}
					
						
					
					break;
				default:
					if (j !== 4) {
						console.log("The table reached an unexpected row");
					}
					break;

			}
		}
		games.push(_.extendDeep(nextGame));

	}
	return games;
	
}

//export methods

exports.parseHTML = function(html, callback) {
	var document = jsdom.jsdom(html),
	    window = document.createWindow();

	jsdom.jQueryify(window, './public/jQuery-ui/js/jquery-1.9.1.js', function() {
		var model = {};
		model.sport = sportName(window);
		model.teams = matrixOfTeams(window);
		model.games = matrixOfGames(window);
		callback(model);
	});
};
