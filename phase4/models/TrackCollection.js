var bookshelf = require('../../base/bookshelf');
var Track = require('./Track');
var _ = require('underscore');

var TrackCollection = bookshelf.Collection.extend({


	model: Track,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.topTracks))
			return;

		_.each(response.topTracks, function(track, index) {

			var track_duration = _.isNaN(parseInt(track.duration)) ? 0 : parseInt(track.duration);
			var track_plays_count = _.isNaN(parseInt(track.playcount)) ? 0 : parseInt(track.playcount);
			var track_listeners_count = _.isNaN(parseInt(track.listeners)) ? 0 : parseInt(track.listeners);

			self.add(new self.model({

				artist_musicbrainz_id: 		response.mbid,
				artist_name: 							response.name,
				track_name: 							track.name,
				track_duration: 					track_duration,
				track_plays_count: 				track_plays_count,
				track_listeners_count: 		track_listeners_count,
				track_musicbrainz_id: 		track.mbid,
				rank: 										index,
				timestamp: 								new Date()
			}));
		});
		return this;
	}

});

module.exports = TrackCollection;