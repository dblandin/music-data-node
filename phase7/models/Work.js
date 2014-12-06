var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var Work = bookshelf.Model.extend({

	idAttribute: 'mbid',

	tableName: 'phase9_musicbrainz_works'

});

module.exports = Work;