var bookshelf = require('../../base/bookshelf');
var Similar = require('./Similar');
var _ = require('underscore');

var SimilarCollection = bookshelf.Collection.extend({


	model: Similar,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.similar))
			return;

		_.each(response.similar, function(similar, index) {

			self.add(new self.model({

				track_musicbrainz_id: 						response.mbid,
				track_name: 											response.name,
				similar_track_musicbrainz_id: 		similar.mbid,
				similar_track_name: 							similar.name,
				match: 														similar.match,
				timestamp:  											new Date()

			}));
		});
		return this;
	}

});

module.exports = SimilarCollection;