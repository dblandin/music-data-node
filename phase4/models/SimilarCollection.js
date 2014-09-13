var bookshelf = require('../../base/bookshelf');
var Similar = require('./Similar');
var _ = require('underscore');

var SimilarCollection = bookshelf.Collection.extend({


	model: Similar,

	
	extractFromRawResponse: function(response) {
		var self = this;
		_.each(response.similar, function(similar, index) {

			self.add(new self.model({

				artist_musicbrainz_id: 						response.mbid,
				artist_name: 											response.name,
				similar_artist_musicbrainz_id: 		similar.mbid,
				similar_artist_name: 							similar.name,
				match: 														similar.match,
				timestamp:  											new Date()
			}));
		});
		return this;
	}

});

module.exports = SimilarCollection;