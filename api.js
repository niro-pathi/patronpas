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
		path : "/patronpas/list",
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

/**
* Add/create methods
*/

//console.log(PatronPAS.def);

exports.addPatronPAS = {
	'spec': {
        path : "/patronpas",
        notes : "Adds a new pas status",
		summary : "Add a new pas status",
		method: "POST",
        parameters : [{
			name: "PatronPAS",
			description: "JSON object representing the patron pas to add",
			required: true,
			type: "PatronPAS",
			paramType: "body"
		}],
        responseMessages : [swe.invalid('input')],
		nickname : "addPatronPAS"
	},
	'action': function(req, res, next) {
		var body = req.body;
		if(!body || !body.patronid){
			throw swe.invalid('Patron ID');
	    } else {
			// Create the new document (database will be updated automatically)
			PatronPAS.model.create({ patronid: body.patronid }, function (err,patronid) {
				if (err) return res.send(500, { error: err });

				if (patronid) {
					res.send(patronid);
				} else {
					res.send(500, { error: 'PAS not added' });
				};
			});
		}
	}
};
