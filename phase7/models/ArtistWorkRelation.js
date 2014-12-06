var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var ArtistWorkRelation = bookshelf.Model.extend({

	tableName: 'phase9_5_musicbrainz_artist_work'

});

module.exports = ArtistWorkRelation;