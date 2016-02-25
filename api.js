/* global next */
/**
* All API methods and database connection info
*/
var mongoose = require('mongoose'),
	sw = require('swagger-node-express'),
	colors = require('colors'),
	swe = sw.errors,
	config = require('./config'),
	util = require('util'),
	db = mongoose.connection;

db.on('error', function() {
	console.log('Database connection error'.red);
});
db.on('connecting', function () {
	console.log('Database connecting'.cyan);
});
db.once('open', function() {
	console.log('Database connection established'.green);
});
db.on('reconnected', function () {
	console.log('Database reconnected'.green);
});

mongoose.connect(config.db_url, {server: {auto_reconnect: true}});

/**
* Load the model files
*/
var PatronPAS = require('./models/patronpas.js');

/**
* List methods
*/
exports.getAllPatrons = {
	'spec': {
		description : "List all Patrons",
		path : "/patrons/list",
		method: "GET",
		summary : "List all patrons",
		notes : "Returns a list of all patrons",
		type : "PatronPAS",
		nickname : "getAllPatrons",
		produces : ["application/json"],
		parameters : [],
		responseMessages : [swe.invalid('patronpas'), swe.notFound('patronpas')]
	},
	'action': function (req,res) {
		PatronPAS.model.find(function(err, patronpas) {
			if (err) return next(swe.invalid('patronpas'))

			if (patronpas) {
				res.send(patronpas);
			} else {
				res.send(404, swe.notFound('patronpas'));
			};
		});
	}
};
