
/*
 * GET home page.
 */

var db = require('../db'),
	fs = require('fs'),
	stream = require('stream'),
    fileParser = require('../fileParser');

exports.index = function(req, res) {
	if (req.user !== undefined) {
		if (typeof req.query.entry !== 'undefined') {
			res.render('index', {tabIndex: parseInt(req.query.entry, 10)});
		} else {
			res.render('index', {tabIndex: 0});
		}
		
	} else {
		res.redirect('/login');
	}
	
  	
};

exports.login = function(req, res) {
	if (req.query.failed !== undefined && req.query.failed === 'true') {
		res.render('login', {warning: 'Incorrect Login Credentials'});
	} else {
		res.render('login', {warning: ''});	
	}
	
	
};


exports.news = function(req, res) {
	if (req.user !== undefined) {
		res.redirect('/');	
	} else {
		res.redirect('/login');
	}
	
};

exports.createNews = function(req, res) {
	console.log(req.body);
	db.addNewsElement(req.body, function(err, result) {
		
		if (!err) {
			res.statusCode = 200;
			res.send(JSON.stringify(result));
		} else {
			res.statusCode = 500;
			res.send(null);
		}
		
	});
	
};

exports.updateNews = function(req, res) {
	console.log(req.body);
	db.updateNewsElement(req.body, function(err, doc) {
		if (!err) {
			res.statusCode = 200;
			res.send(JSON.stringify(doc));
		} else {
			res.statusCode = 500;
			res.send(null);
		}
	});
	
};


exports.deleteNews = function(req, res) {
	//should return _id of the element that was deleted
	var removedDoc = db.removeNewsElementWithID(req.headers._id, function(err, deletedID) {

		if (err || typeof deletedID === null) {
			res.statusCode = 500;
			res.send(new Error("failed to remove document"));
		} else {
			res.statusCode = 200;
			res.send({_id: deletedID});
		}
	});
	

};

//hours methods
exports.hours = function(req, res) {
	if (req.user !== undefined) {
		res.redirect('/?entry=1')
	} else {
		res.redirect('/login');
	}
	
};

exports.updateHours = function(req, res) {
	var data = req.body;

	db.updateHours(data, function(err, doc) {
		if(err) {
			res.statusCode = 500;
			res.send(err);
		} else {
			res.statusCode = 200;
			res.send(doc);
		}

	});
};

exports.createHours = function(req, res) {
	var data = req.body;
	db.createHours(data, function(err, doc) {
		if (err) {
			res.statusCode = 500;
			res.send(err);
		} else {
			res.statusCode = 200;
			res.send(doc);
		}
	});
};

exports.deleteHours = function(req, res) {
	
	db.deleteHours(req.headers._id, function(err, id) {
		if (err) {
			res.statusCode = 500;
			res.send(err);
		} else {
			res.statusCode = 200;
			res.send(id);
		}
	});

};

//traffic methods 
exports.traffic = function(req, res) {
	if (req.user !== undefined) {
		res.redirect('/?entry=2');
	} else {
		res.redirect('/login');
	}
	
};



//group fitness methods
exports.groupFitness = function(req, res) {
	if (req.user !== undefined) {
		res.redirect('/?entry=3');
	} else {
		res.redirect('/login');
	}
	
};

//there will never be an update of a special date
//special dates can only be created and deleted
exports.updateGF = function(req, res) {

	var data = req.body;
	//add data that can be used for server side querying
	var startDateArray = data.startDate.split('/');
	data.SD_monthCount = (parseInt(startDateArray[2], 10) -1970) * 12 + (parseInt(startDateArray[0], 10) - 1);
	if (data.endDate === '*') {
		//monthCount of 0 indicates that it goes infinitely
		data.ED_monthCount = 0;
	} else {
		var endDateArray = data.endDate.split('/');
		data.ED_monthCount = (parseInt(endDateArray[2], 10) - 1970) * 12 + (parseInt(endDateArray[0], 10) - 1);
	}

	db.updateGFClass(data, function(err, doc) {
		if (err) {
			res.statusCode = 500;
			res.send(err);
		} else {
			res.statusCode = 200;
			res.send(doc);
		}
	});
};

exports.createGF = function(req, res) {
	console.log("Create GF was called");
	if (req.body.type === 'GFClass') {
		var data = req.body;
		//add data that can be used for server side querying
		var startDateArray = data.startDate.split('/');
		data.SD_monthCount = (parseInt(startDateArray[2], 10) -1970) * 12 + (parseInt(startDateArray[0], 10) - 1);
		if (data.endDate === '*') {
			//monthCount of 0 indicates that it goes infinitely
			data.ED_monthCount = 0;
		} else {
			var endDateArray = data.endDate.split('/');
			data.ED_monthCount = (parseInt(endDateArray[2], 10) - 1970) * 12 + (parseInt(endDateArray[0], 10) - 1);
		}
		db.insertGFClass(data, function(err, document) {
			res.statusCode = 200;
			res.send(document);
		});

	//must be a special date	
	} else if (req.body.type === 'GFSpecialDate') {
		db.insertGFSpecialDate(req.body, function(err, document) {
			res.statusCode = 200;
			res.send(document);
		});
	} else {
		//something is wrong with the sent data
		res.statusCode = 409;
		res.send("The data that was received is missing a valid type parameter");
	}
	
}

exports.deleteGF = function(req, res) {
	db.deleteGFObjectWithID(req.headers._id, function(err, id) {

		if (err) {
			res.statusCode = 500;
			res.send({error: new Error("Could not delete element")});
		} else {
			res.statusCode = 200;
			res.send({id: id});
		}
		
	});
};

//intramurals methods
exports.intramurals = function(req, res) {
	if (req.user !== undefined) {
		res.redirect('/?entry=4');
	} else {
		res.redirect('/login');
	}
	
};

exports.createIntramurals = function(req, res) {
	var data = req.body;
	db.insertIntramurals(data, function(err, object) {
		if (err) {
			res.statusCode = 500;
			res.send(err);

		} else {
			res.statusCode = 200;
			res.send(object);
		}
		
	});
};

exports.updateIntramurals = function(req, res) {
	var data = req.body;
	db.updateIntramurals(data, function(err, object) {
		if (err) {
			res.statusCode = 500;
			res.send(err);
		} else {
			res.statusCode = 200;
			res.send(object);
		}
	});
};

exports.deleteIntramurals = function(req, res) {
	
	db.deleteIntramurals(req.headers._id, function(err, sport) {
		if (err) {
			res.statusCode = 500;
			res.send(err);
		} else {
			res.statusCode = 200;
			res.send(sport);
		}
		
	});

};

exports.intramuralFiles = function(req, res) {
	if (!req.files) {
		//should create an error page
		res.redirect('/intramurals');
	} else {
		fs.readFile(req.files.intramuralsSport.path, function(err, data) {
			
			//the errors callback consists of all the things wrong with
			//the html file that was uploaded
			fileParser.parseSport(data, function(sport, parsingErrors) {
				
				db.insertIntramurals(sport, function(err, DB_Sports) {
					var DB_Sport = DB_Sports[0];
					if (!err) {
						res.statusCode = 200;

						if (!parsingErrors || parsingErrors.length === 0) {
							res.redirect('/intramurals/details?id='+DB_Sport._id);
						} else {
							res.redirect('/intramurals/details?id='+DB_Sport._id + '&errors=' + encodeURIComponent(parsingErrors.join()));
						}
					} else {
						res.statusCode = 500;
						res.redirect('/intramurals/details?errors=There was an error when saving to the database');
					}
					
						
				});
				

			});
		});
	}
	

};

exports.intramuralsDetails = function(req, res) {
	if (req.user) {
		if (req.query.renderHTML && req.query.renderHTML === 'true') {
			res.render('sportsDetails');
			res.attachment();
		} else {
			res.render('sportsDetails');
		}
		
	} else {
		res.redirect('/login');
	}
	
};

exports.downloadHTML = function(req, res) {
	var filename = "IM_raw";
		//filestream = new stream.Duplex();
	if (req.query.id) {
		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.setHeader('Content-type', 'text/html');
		console.log(req.query.id);
		db.getIntramuralWithID(req.query.id, function(err, sport) {

			fileParser.sportToHTML(sport, function(err, data) {
				if (err) throw err;
				res.send(data);
			});
		});
	} else {
		res.statusCode = 404;
		res.send("File could not be found");
	}
};

//programs method
exports.programs = function(req, res) {
	if (req.user) {
		res.redirect('/?entry=5');
	} else {
		res.redirect('/login');
	}
	
};


//serves raw ejs files for jQuery tabs
exports.newsRaw = function(req, res) {
	res.render('news');
};
exports.hoursRaw = function(req, res) {
	res.render('hours');
};
exports.trafficRaw = function(req, res) {
	res.render('traffic');
};
exports.groupFitnessRaw = function(req, res) {
	res.render('groupFitness');
};
exports.intramuralsRaw = function(req, res) {
	res.render('intramurals');
};
exports.programsRaw = function(req, res) {
	res.render('programs');
};