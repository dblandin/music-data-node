var bookshelf = require('../../base/bookshelf');
var SongType = require('./SongType');
var _ = require('underscore');

var SongTypeCollection = bookshelf.Collection.extend({


	model: SongType,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if(!_.isArray(response))
			return;

		_.each(response, function(song) {

			var types = song.song_type;
			
			if(!_.isArray(types))
				return;

			_.each(types, function(type, index) {

				self.add(new self.model({

					echonest_id: 	song.id,
					name: 				type,
					rank: 				index + 1,
					timestamp: 		new Date()

				}));

			});
		});
		return this;
	}

});

module.exports = SongTypeCollection;

	