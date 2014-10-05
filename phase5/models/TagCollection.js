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

			var count = _.isNaN(parseInt(tag.count)) ? null : parseInt(tag.count);

			self.add(new self.model({

				album_musicbrainz_id: 		response.mbid,
				album_name: 							response.name,
				album_lastfm_id: 					response.id,
				tag_name: 								tag.name,
				tag_count: 								count,
				timestamp:  							new Date()
			}));
		});
		return this;
	}

});

module.exports = TagCollection;