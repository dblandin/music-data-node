var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Fan = bookshelf.Model.extend({

	tableName: 'phase6_lastfm_top_fans'

});

module.exports = Fan;