var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var ArtistReleaseRelation = bookshelf.Model.extend({

	tableName: 'phase8_5_musicbrainz_artist_release_groups'

});

module.exports = ArtistReleaseRelation;