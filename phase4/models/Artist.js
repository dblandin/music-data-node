var bookshelf = require('../../base/bookshelf');
var util = require('../../base/utilities');
var _ = require('underscore');

var Artist = bookshelf.Model.extend({


	tableName: 'phase4_lastfm_artists',


	extractFromRawResponse: function(response) {

		var playcount = _.isNaN(parseInt(response.stats.playcount)) ? 0 : parseInt(response.stats.playcount);
		var listeners = _.isNaN(parseInt(response.stats.listeners)) ? 0 : parseInt(response.stats.listeners);

		this.set({

			name: 						response.name,
			musicbrainz_id: 	response.mbid,
			listeners: 				listeners,
			playcount: 				playcount,
			biography: 				this.trimAndStripHtml(response.bio.content),
			biography_date: 	response.bio.published,
			timestamp: 				new Date()

		});
		return this;
	},


	trimAndStripHtml: function(text) {
		return text.replace(/(<([^>]+)>)/ig, '').trim();
	}
});

module.exports = Artist;