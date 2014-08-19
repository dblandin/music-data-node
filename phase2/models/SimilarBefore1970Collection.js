var bookshelf = require('../../base/bookshelf');
var Similar = require('./SimilarBefore1970');
var _ = require('underscore');

var SimilarCollection = bookshelf.Collection.extend({


	model: Similar,

	
	extractFromRawReponse: function(response) {
		var self = this;
		_.each(response.oldSimilar, function(similar, index) {

			self.add(new self.model({

				echonest_artist_id: 	response.id,
				similar_artist_id: 		similar.id,
				similar_artist_name: 	similar.name,
				rank: 								index + 1,
				familiarity_rank: 		similar.familiarity_rank,
				hotttnesss_rank: 			similar.hotttnesss_rank,
				timestamp: 						new Date()

			}));
		});
		return this;
	}

});

module.exports = SimilarCollection;