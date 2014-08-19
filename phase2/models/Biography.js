var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Biographies = bookshelf.Model.extend({

	tableName: 'phase2_echonest_artist_biographies'

});

module.exports = Biographies;