var bookshelf = require('../../base/bookshelf');
var SongType = require('./SongType');
var _ = require('underscore');

var SongTypeCollection = bookshelf.Collection.extend({


	model: SongType,

	
	extractFromRawReponse: function(response) {
		var self = this;
		_.each(response, function(song) {

			var types = song.song_type;

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

	