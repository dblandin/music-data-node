var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Term = bookshelf.Model.extend({

	tableName: 'phase2_echonest_artist_terms'

});

module.exports = Term;