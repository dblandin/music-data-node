var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Song = bookshelf.Model.extend({


	tableName: 'phase3_echonest_tracks'
	
});

module.exports = Song;