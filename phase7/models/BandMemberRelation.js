var bookshelf = require('../../base/bookshelf');

var BandMemberRelation = bookshelf.Model.extend({

	tableName: 'phase7_5_musicbrainz_band_members'
	
});

module.exports = BandMemberRelation;