var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Artist = bookshelf.Model.extend({

	tableName: 'phase7_musicbrainz_artists',

	extractFromRawResponse: function(response) {
		this.set({
			mbid: response.id,
		  name: response.name,
		  name_accents: response.artistaccent,
		  name_alias: response.alias[0],
		  gender: response.gender,
		  country: response.country,
		  start: response.begin,
		  end: response.end,
			timestamp: new Date()
		})
	}

});

module.exports = Artist;