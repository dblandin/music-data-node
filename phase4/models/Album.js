var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Album = bookshelf.Model.extend({

	tableName: 'phase4_lastfm_top_albums'

});

module.exports = Album;