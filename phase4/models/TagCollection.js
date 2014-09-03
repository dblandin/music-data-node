var bookshelf = require('../../base/bookshelf');
var Tag = require('./Tag');
var _ = require('underscore');

var TagCollection = bookshelf.Collection.extend({


	model: Tag,

	
	extractFromRawResponse: function(response) {
		var self = this;
		_.each(response.topTags, function(tag, index) {

			self.add(new self.model({

				// artist_musicbrainz_id: 						response.mbid,
				// similar_artist_musicbrainz_id: 		tag.mbid,
				// similar_artist_name: 							tag.name,
				// match: 														tag.match
			}));
		});
		return this;
	}

});

module.exports = TagCollection;