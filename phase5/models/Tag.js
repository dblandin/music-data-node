var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Tag = bookshelf.Model.extend({

	tableName: 'phase5_lastfm_top_tags'

});

module.exports = Tag;