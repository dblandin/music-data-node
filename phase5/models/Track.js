var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Track = bookshelf.Model.extend({

	tableName: 'phase5_lastfm_album_tracks'

});

module.exports = Track;