var bookshelf = require('../../base/bookshelf');
var util = require('../../base/utilities');
var _ = require('underscore');

var Album = bookshelf.Model.extend({


	tableName: 'phase5_lastfm_albums',


	extractFromRawResponse: function(response) {

		if(!response || !_.isObject(response) || _.isEmpty(response))
			return;

		var listeners = _.isNaN(parseInt(response.listeners)) ? null : parseInt(response.listeners);

		this.set({

			name: 									response.name,
			lastfm_id:  						response.id,
			musicbrainz_id: 				response.mbid,
			artist_name: 						response.artist,
			artist_musicbrainz_id:  response.artist_musicbrainz_id,
 			release_date: 					response.releasedate.trim(),
			listeners_count: 				listeners,
			playcount: 							response.playcount,
			timestamp: 							new Date()

		});
		return this;
	}
});

module.exports = Album;