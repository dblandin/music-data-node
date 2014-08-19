var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Type = bookshelf.Model.extend({

	tableName: 'phase3_echonest_track_types'

});

module.exports = Type;