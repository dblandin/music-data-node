var bookshelf = require('../../base/bookshelf');
var Fan = require('./Fan');
var _ = require('underscore');

var FanCollection = bookshelf.Collection.extend({


	model: Fan,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.topFans))
			return;

		_.each(response.topFans, function(fan, index) {

			self.add(new self.model({

				track_musicbrainz_id: 		response.mbid,
				track_name: 							response.name,
				user_name: 								fan.name,
				weight:  									fan.weight,
				timestamp: 								new Date()
				
			}));
		});
		return this;
	}

});

module.exports = FanCollection;