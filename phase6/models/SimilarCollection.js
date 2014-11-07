var bookshelf = require('../../base/bookshelf');
var Similar = require('./Similar');
var _ = require('underscore');

var SimilarCollection = bookshelf.Collection.extend({


	model: Similar,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.similar))
			return this;

		_.each(response.similar, function(similar, index) {

			var match = _.isNaN(parseFloat(similar.match)) ? null : parseFloat(similar.match);

			self.add(new self.model({

				artist_name: 											response.artist_name,
				artist_musicbrainz_id: 						response.artist_musicbrainz_id,
				track_musicbrainz_id: 						response.mbid,
				track_name: 											response.name,
				similar_track_musicbrainz_id: 		similar.mbid,
				similar_track_name: 							similar.name,
				similar_artist_name: 							_.isObject(similar.artist) ? similar.artist.name : null,
				similar_artist_musicbrainz_id: 		_.isObject(similar.artist) ? similar.artist.mbid : null,
				match: 														match,
				timestamp:  											new Date()

			}));
		});
		return this;
	}

});

module.exports = SimilarCollection;