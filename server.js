/**
*
*
*
* @author Niro Pathirana
*
* @requires express 		Routing module
* @requires url 			Allows the URL to be read
* @requires fs 				Provides access to the servers file system
* @requires colors			Lets the app show colored output in the console window
* @requires swagger 		Generates the API docs dynamically
* @requires express-extras 	Adds additional middleware options to express; used for throttling
*
* @uses config.js
* @uses api.js
* @uses models/*
*
* @beta
*/


var express = require("express"),
	url = require("url"),
	fs = require('fs'),
	color = require('colors'),
	extras = require('express-extras'),
	api = require('./api.js'),
	util = require('util'),
	bodyParser = require('body-parser');

var app = express(),
	swagger = require('swagger-node-express').createNew(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setup throttling to keep users from abusing the API
app.use(extras.throttle({
	urlCount: 100,
	urlSec: 1,
	holdTime: 10,
	whitelist: {
	 	'127.0.0.1': true
	 }
}));

// Set the main handler in swagger to the express app
// swagger.setAppHandler(app);

// This is a sample validator.  It simply says that for _all_ POST, DELETE, PUT
// methods, the header `api_key` OR query param `api_key` must be equal
// to the string literal `1234`.  All other HTTP ops are A-OK
swagger.addValidator(
	function validate(req, path, httpMethod) {
		//  example, only allow POST for api_key="special-key"
		if ("POST" == httpMethod || "DELETE" == httpMethod || "PUT" == httpMethod) {
			var apiKey = req.headers["api_key"];
			if (!apiKey) {
				apiKey = url.parse(req.url,true).query["api_key"];
			}
			if ("1234" == apiKey) {
				return true;
			}
			return false;
		}
		return true;
	}
);

// Find all of the model files in the 'models' folder and add the their definitions to swagger
// so it can be displayed in the docs
var models = {"models":{}},
	modelPath = 'models';
require("fs").readdirSync(modelPath).forEach(function(file) {
    console.log('Load models from - ' + file);
    var outMod = require('./' + modelPath + '/' + file).model;
    for (var atr in outMod) {
        models.models[atr] = outMod[atr];
    }
});
swagger.addModels(models);

// Add methods to swagger
swagger
	.addGet(api.getAllPatrons)

// set api info
swagger.setApiInfo({
	title: "Patron PAS Microservice",
	description: "This is a microservice that manage patron PAS functions, you can use the api key \"1234\" to test the authorization filters"
});

swagger.setAuthorizations({
	apiKey: {
		type: "apiKey",
		passAs: "header"
	}
});

// Configures the app's base path and api version.
swagger.configureSwaggerPaths("", "api-docs", "")
swagger.configure("http://localhost:8005", "0.0.1");

// Serve up swagger ui at /docs via static route
var docs_handler = express.static(__dirname + '/swagger-ui/');
app.get(/^\/docs(\/.*)?$/, function(req, res, next) {
	if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
		res.writeHead(302, { 'Location' : req.url + '/' });
		res.end();
		return;
	}
	// take off leading /docs so that connect locates file correctly
	req.url = req.url.substr('/docs'.length);
	return docs_handler(req, res, next);
});

// Start the server on port 8002
app.listen(8005);
