var bookshelf = require('../../base/bookshelf');
var Genre = require('./Genre');
var _ = require('underscore');

var GenreCollection = bookshelf.Collection.extend({


	model: Genre,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if(!_.isArray(response.genres))
			return;

		_.each(response.genres, function(genre, index) {

			self.add(new self.model({

				echonest_id: 	response.id,
				name: 				genre.name,
				rank: 				index + 1,
				timestamp: 		new Date()

			}));
		});
		return this;
	}

});

module.exports = GenreCollection;

	