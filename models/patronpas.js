/**
* The schema and model for patron pas data
*/

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var patronpasSchema = new mongoose.Schema({
  patronid: String,
  status: String,
  collectionmethod: String,
  updated_at: { type: Date, default: Date.now },
});

exports.def =
	{
		"PatronPAS":{
			"id":"PatronPAS",
            "required": ["patronid", "status","collectionmethod"],
			"properties":{
				"patronid":{
					"type":"string",
					"description": "Patron unique identifier"
				},
				"status":{
					"type":"string",
					"description": "PAS Status"
				},
				"collectionmethod":{
					"type":"string",
					"description": "PAS Collection Method"
				},
				"updated_at":{
					"type":"Date",
					"description": "Last Updated Date"
				}
			}
		}
};

exports.model = mongoose.model('patronpas', patronpasSchema);
