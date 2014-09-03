var bookshelf = require('../../base/bookshelf');
var Album = require('./Album');
var _ = require('underscore');

var AlbumCollection = bookshelf.Collection.extend({


	model: Album,

	
	extractFromRawResponse: function(response) {
		var self = this;
		_.each(response.topAlbums, function(album, index) {

			self.add(new self.model({

				artist_name:  						response.name,
				artist_musicbrainz_id: 		response.mbid,
				album_musicbrainz_id: 		album.mbid,
				album_name:  							album.name,
				album_rank: 				 			index,
				album_listeners_count:		album.playcount,
				timestamp:  							new Date()
			}));
		});
		return this;
	}

});

module.exports = AlbumCollection;