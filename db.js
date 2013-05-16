var mongodb = require('mongodb'),
	Db = require('mongodb').Db,
	MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server,
	ObjectID = require('mongodb').ObjectID;

var MONGODB_URL;
var newsCol = 'news';

//this function must be called before any subsequent function in this module
//can work.  The MONGO_URL must be set before DB calls are made
exports.setURL = function(MONGO_URL) {
	MONGODB_URL = MONGO_URL;
}
//related to the news collection
exports.newsCollection = function(callback) {
	// Set up the connection to the local db

	// Open the connection to the server
	
	Db.connect(MONGODB_URL, function(err, db) {
  		// Get the first db and do an update document on it
  		
  		db.collection(newsCol, function(err, collection) {

			collection.find(function(err, cursor) {

				cursor.toArray(function(err, collection) {
					callback(collection);

					db.close();
				});
			});
		});

	});		
}

//removes the element with the ID and returns the ID
//callback has two parameters: error and isRemoved
exports.removeNewsElementWithID = function(mongoID, callback) {
	
	//NOTE: db.close() should be nested inside the callback functions
	//so that the database does not close before operations are complete!!
	Db.connect(MONGODB_URL, function(err, db) {

		var parsedID = new ObjectID.createFromHexString(mongoID);
		db.collection(newsCol, function(err, collection) {
			
			collection.remove({_id : parsedID}, {w: 1}, function(err, numberRemoved) {
				
				if (err) {
					callback(err, null);
				}
				if (numberRemoved === 1) {
					callback(err, mongoID);
				} else {
					callback(new Error("Did not remove 1 element from the database"), null);
				}
				db.close();
			});
		});
	});
};

//callback function takes a parameter of err and the documents 
//new id that was created
exports.addNewsElement = function(model, callback) {
	
	Db.connect(MONGODB_URL, function(err, db) {
		db.collection(newsCol, function(err, collection) {

			//returns an array of the documents that were added, with the
			//_id added to the JSON object, there should only be 1 document 
			//added at a time
			collection.insert(model, {w:1}, function(err, docs) {
				callback(err, docs[0]);
				db.close();

			});
		});
	});
}

//callback function takes parameters of the error message and the document
//that was updated
exports.updateNewsElement = function(model, callback) {
	
	Db.connect(MONGODB_URL, function(err, db) {
		
		var parsedID = new ObjectID.createFromHexString(model._id);

		db.collection(newsCol, function(err, collection) {
			
			collection.update(
				{_id: parsedID}, //selector
				{ //updated properties
					priorityNumber: model.priorityNumber,
					description: model.description,
					author: model.author
				},
				{w: 1, upsert: true}, function(err, doc) {

				
				callback(err, doc);
				db.close();
			});
		});
	});
}