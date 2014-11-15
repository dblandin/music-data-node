var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Similar = bookshelf.Model.extend({

	tableName: 'phase6_lastfm_similar_tracks'

});

module.exports = Similar;