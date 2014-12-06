var bookshelf = require('../../base/bookshelf');
var ArtistWorkRelation = require('./ArtistWorkRelation');
var _ = require('underscore');

var ArtistWorkRelationCollection = bookshelf.Collection.extend({


	model: ArtistWorkRelation,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.works))
			return this;

		_.each(response.works, function(work, index) {

			for (var i = 0; i < work.relations.length; i++) {
				
				if(!work.relations[i].artist) 
					continue;

				self.add(new self.model({

					artist: work.relations[i].artist.id,
				  work: work.id,
				  type: work.relations[i].type,
					timestamp: new Date()

				}));
			}
		});
		return this;
	}

});

module.exports = ArtistWorkRelationCollection;