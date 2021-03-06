var db = require('../db');

exports.news = function(req, res) {
	db.newsCollection(function(collection) {
		res.statusCode = 200;
		res.send(collection);
	});
};

exports.hours = function(req, res) {
	db.hoursCollection(function(collection) {
		res.statusCode = 200;
		res.send(collection);
	});
};

exports.groupFitness = function(req, res) {
	if (typeof req.query.type === 'undefined') {
		db.allGFObjects(function(err, collection) {
				res.statusCode = 200;
				res.send(collection);
			});
	} else if (req.query.type.toUpperCase() === 'GFCLASS') {
		if (typeof req.query.month === 'undefined' || req.query.year === 'undefined') {

			//need to change this to only send GFClass data
			db.allGFObjects(function(err, collection) {
				res.statusCode = 200;
				res.send(collection);
			});
		} else {
			var monthIndex = parseInt(req.query.month,10);
			var year = parseInt(req.query.year, 10);
			//calculate the month for the value passed in
			var monthCount = (year - 1970) * 12 + monthIndex; 
			console.log(monthCount);
			db.GFClassesForDates(monthCount, function(err, collection) {
				res.statusCode = 200;
				res.send(collection);
			});
		}
	} else if (req.query.type.toUpperCase() === 'GFSPECIALDATE') {
		db.GFSpecialDates(function(err, collection) {
			res.statusCode = 200;
			res.send(collection);
		});
	} else {
		res.statusCode = 409;
		res.send("Type parameter was not recognized by GET method, must be GFSpecialDate or GFClass");
	}
	
};


exports.intramurals = function(req, res) {
	if (req.query.season) {
		db.getIntramuralsForSeason(+req.query.season, function(err, intramurals) {
			res.send(intramurals);
		});
	} else {
		db.getIntramurals(function(err, intramurals) {
			res.send(intramurals);
		});
	}
	
};

