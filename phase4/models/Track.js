var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Track = bookshelf.Model.extend({

	tableName: 'phase4_lastfm_top_tracks'

});

module.exports = Track;