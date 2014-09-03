var bookshelf = require('../../base/bookshelf');
var Track = require('./Track');
var _ = require('underscore');

var TrackCollection = bookshelf.Collection.extend({


	model: Track,

	
	extractFromRawResponse: function(response) {
		var self = this;
		_.each(response.topTracks, function(track, index) {

			self.add(new self.model({

				artist_musicbrainz_id: 						response.mbid,
				similar_artist_musicbrainz_id: 		track.mbid,
				similar_artist_name: 							track.name,
				match: 														track.match
			}));
		});
		return this;
	}

});

module.exports = TrackCollection;