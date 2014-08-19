var bookshelf = require('../../base/bookshelf');
var util = require('../../base/utilities');
var _ = require('underscore');

var Artist = bookshelf.Model.extend({


	tableName: 'phase2_echonest_artists',


	extractFromRawReponse: function(response) {
		var years = _.isArray(response.years_active) ? response.years_active : null;
		this.set({

			echonest_id: 			response.id,
			name: 						response.name,
			musicbrainz_id: 	util.getFirstForeignId('musicbrainz', response.foreign_ids),
			whosampled_id: 		util.getFirstForeignId('whosampled', response.foreign_ids),
			discogs_id: 			util.getFirstForeignId('discogs', response.foreign_ids),
			songkick_id: 			util.getFirstForeignId('songkick', response.foreign_ids),
			songmeanings_id: 	util.getFirstForeignId('songmeanings', response.foreign_ids),
			spotifymm_id: 		util.getFirstForeignId('spotify', response.foreign_ids),
			discovery: 				response.discovery,
			location_1: 			response.artist_location ? response.artist_location.city : null,
			location_2: 			response.artist_location ? response.artist_location.region : null,
			location_3: 			response.artist_location ? response.artist_location.country : null,
			start_1:					years && years.length >= 1 ? years[0].start : null,
			end_1: 						years && years.length >= 1 ? years[0].end : null,
			start_2:					years && years.length >= 2 ? years[1].start : null,
			end_2: 						years && years.length >= 2 ? years[1].end : null,
			start_3:					years && years.length >= 3 ? years[2].start : null,
			end_3: 						years && years.length >= 3 ? years[2].end : null,
			familiarity: 			response.familiarity,
			hotttnesss: 			response.hotttnesss,
			timestamp: 				new Date()

		});
		return this;
	}
});

module.exports = Artist;