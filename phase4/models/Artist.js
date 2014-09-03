var bookshelf = require('../../base/bookshelf');
var util = require('../../base/utilities');
var _ = require('underscore');

var Artist = bookshelf.Model.extend({


	tableName: 'phase4_lastfm_artists',


	extractFromRawResponse: function(response) {

		this.set({

			name: 						response.name,
			musicbrainz_id: 	response.mbid,
			listeners: 				response.stats.listeners,
			playcount: 				response.stats.playcount,
			biography: 				response.bio.content,
			biography_date: 	response.bio.published,
			timestamp: 				new Date()

		});
		return this;
	}
});

module.exports = Artist;