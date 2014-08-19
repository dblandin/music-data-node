var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Similar = bookshelf.Model.extend({

	tableName: 'phase2_echonest_similar_artists_post1969'

});

module.exports = Similar;