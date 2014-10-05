var bookshelf = require('../../base/bookshelf');
var util = require('../../base/utilities');
var _ = require('underscore');

var Artist = bookshelf.Model.extend({

	tableName: 'phase0_lastfm_artists',

});

module.exports = Artist;