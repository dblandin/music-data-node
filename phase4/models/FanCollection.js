var bookshelf = require('../../base/bookshelf');
var Fan = require('./Fan');
var _ = require('underscore');

var FanCollection = bookshelf.Collection.extend({


	model: Fan,

	
	extractFromRawResponse: function(response) {
		var self = this;
		_.each(response.topFans, function(fan, index) {

			self.add(new self.model({

				// artist_musicbrainz_id: 						response.mbid,
				// similar_artist_musicbrainz_id: 		similar.mbid,
				// similar_artist_name: 							similar.name,
				// match: 														similar.match
			}));
		});
		return this;
	}

});

module.exports = FanCollection;