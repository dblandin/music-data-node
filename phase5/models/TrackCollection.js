var bookshelf = require('../../base/bookshelf');
var Track = require('./Track');
var _ = require('underscore');

var TrackCollection = bookshelf.Collection.extend({


	model: Track,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.tracks.track))
			return;

		_.each(response.tracks.track, function(track, index) {

			self.add(new self.model({

				album_musicbrainz_id: 		response.mbid,
				album_name: 							response.name,
				album_lastfm_id: 					response.id,
				track_name: 							track.name,
				track_musicbrainz_id: 		track.mbid,
				position: 								index + 1,
				timestamp: 								new Date()
				
			}));
		});
		return this;
	}

});

module.exports = TrackCollection;