var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var ReleaseGroup = bookshelf.Model.extend({

	idAttribute: 'mbid',

	tableName: 'phase8_musicbrainz_release_group'

});

module.exports = ReleaseGroup;