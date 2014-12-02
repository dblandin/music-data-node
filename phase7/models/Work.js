var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Work = bookshelf.Model.extend({

	tableName: 'phase9_musicbrainz_works'

});

module.exports = Work;