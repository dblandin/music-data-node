var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Artist = bookshelf.Model.extend({

	tableName: 'phase7_musicbrainz_artists',

	idAttribute: 'mbid',

	extractFromRawResponse: function(response) {
		var lifeSpan = response['life-span'];
		var start = lifeSpan && _.isString(lifeSpan.begin) ? parseInt(lifeSpan.begin.split('-')[0]) : null;
		var end = lifeSpan && _.isString(lifeSpan.end) ? parseInt(lifeSpan.end.split('-')[0]) : null;

		this.set({
			mbid: response.id,
		  name: response.name,
		  type: response.type,
		  name_alias: _.isArray(response.aliases) && !_.isEmpty(response.aliases) ? response.aliases[0].name : null,
		  country: response.country,
		  start: _.isNaN(start) || _.isNull(start) ? null : start,
		  end: _.isNaN(end) || _.isNull(end) ? null : end,
			timestamp: new Date()
		});

		return this;
	}

});

module.exports = Artist;