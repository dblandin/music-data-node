var bookshelf = require('../../base/bookshelf');
var ArtistReleaseRelation = require('./ArtistReleaseRelation');
var _ = require('underscore');

var WorkCollection = bookshelf.Collection.extend({


	model: ArtistReleaseRelation,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.releaseGroups))
			return this;

		_.each(response.releaseGroups, function(releaseGroup, index) {

			for (var i = 0; i < releaseGroup['artist-credit'].length; i++) {
				self.add(new self.model({

					artist: releaseGroup['artist-credit'][i].artist.id,
				  release_group: releaseGroup.id

				}));
			}
		});
		return this;
	}

});

module.exports = WorkCollection;