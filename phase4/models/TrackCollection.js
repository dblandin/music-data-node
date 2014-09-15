var bookshelf = require('../../base/bookshelf');
var Track = require('./Track');
var _ = require('underscore');

var TrackCollection = bookshelf.Collection.extend({


	model: Track,

	
	extractFromRawResponse: function(response) {
		var self = this;

		!_.isArray(response.topTracks)
			return;

		_.each(response.topTracks, function(track, index) {

			self.add(new self.model({

				artist_musicbrainz_id: 		response.mbid,
				artist_name: 							response.name,
				track_name: 							track.name,
				track_duration: 					parseInt(track.duration),
				track_plays_count: 				parseInt(track.playcount),
				track_listeners_count: 		parseInt(track.listeners),
				track_musicbrainz_id: 		track.mbid,
				rank: 										index,
				timestamp: 								new Date()
			}));
		});
		return this;
	}

});

module.exports = TrackCollection;