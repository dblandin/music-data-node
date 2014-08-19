var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Review = bookshelf.Model.extend({

	tableName: 'phase2_echonest_artist_reviews'

});

module.exports = Review;