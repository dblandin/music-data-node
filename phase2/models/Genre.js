var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Genre = bookshelf.Model.extend({

	tableName: 'phase2_echonest_artist_genres'

});

module.exports = Genre;