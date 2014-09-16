var bookshelf = require('../../base/bookshelf');
var Tag = require('./Tag');
var _ = require('underscore');

var TagCollection = bookshelf.Collection.extend({


	model: Tag,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.topTags))
			return;

		_.each(response.topTags, function(tag, index) {

			self.add(new self.model({

				artist_musicbrainz_id: 		response.mbid,
				artist_name: 							response.name,
				tag_name: 								tag.name,
				tag_count: 								tag.count,
				timestamp:  							new Date()
			}));
		});
		return this;
	}

});

module.exports = TagCollection;