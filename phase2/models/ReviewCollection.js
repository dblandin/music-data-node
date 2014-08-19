var bookshelf = require('../../base/bookshelf');
var Review = require('./Review');
var _ = require('underscore');

var ReviewCollection = bookshelf.Collection.extend({


	model: Review,


	limitPerArtist: 5,

	
	extractFromRawReponse: function(response) {
		var self = this;
		_.each(_.first(response.reviews, this.limitPerArtist), function(review) {

			self.add(new self.model({

				echonest_id: response.id,
				name: review.name,
				summary: review.summary,
				url: review.url,
				date: review.date_reviewed,
				timestamp: new Date()

			}));
		});
		return this;
	}

});

module.exports = ReviewCollection;