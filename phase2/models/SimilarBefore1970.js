var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Similar = bookshelf.Model.extend({

	tableName: 'phase2_echonest_similar_artists_pre1970'

});

module.exports = Similar;