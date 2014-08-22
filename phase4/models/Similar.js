var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Similar = bookshelf.Model.extend({

	tableName: 'phase4_lastfm_similar_artists'

});

module.exports = Similar;