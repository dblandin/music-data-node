var bookshelf = require('../../base/bookshelf');
var Song = require('./Song');
var _ = require('underscore');
var util = require('../../base/utilities');

var SongCollection = bookshelf.Collection.extend({


	model: Song,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if(!_.isArray(response))
			return;

		_.each(response, function(song) {

			var track = song.audio_summary;
			var lyricfindIds = util.getAllForeignIds('lyricfind-US', song.foreign_ids);
			var whosampledIds = util.getAllForeignIds('whosampled', song.foreign_ids);
			var songmeaningsIds = util.getAllForeignIds('songmeanings', song.foreign_ids);
			var spotifyIds = util.getAllForeignIds('spotify', song.foreign_ids);
			var types = self.getTypesString(song.song_type);

			self.add(new self.model({

				echonest_id:						song.id,
				title: 									song.title,
				echonest_artist_id: 		song.artist_id,
				currency: 							song.song_currency,
				hotttnesss: 						song.song_hotttnesss,

				lyricfind_id_1: 				lyricfindIds.length >= 1 ? lyricfindIds[0] : null, 
				lyricfind_id_2: 				lyricfindIds.length >= 2 ? lyricfindIds[1] : null, 
				lyricfind_id_3: 				lyricfindIds.length >= 3 ? lyricfindIds[2] : null, 
				lyricfind_id_4: 				lyricfindIds.length >= 4 ? lyricfindIds[3] : null, 
				lyricfind_id_5: 				lyricfindIds.length >= 5 ? lyricfindIds[4] : null, 

				whosampled_id_1: 				whosampledIds.length >= 1 ? whosampledIds[0] : null,
				whosampled_id_2: 				whosampledIds.length >= 2 ? whosampledIds[1] : null,
				whosampled_id_3: 				whosampledIds.length >= 3 ? whosampledIds[2] : null,
				whosampled_id_4: 				whosampledIds.length >= 4 ? whosampledIds[3] : null,
				whosampled_id_5: 				whosampledIds.length >= 5 ? whosampledIds[4] : null,

				songmeanings_id_1: 			songmeaningsIds.length >= 1 ? songmeaningsIds[0] : null, 
				songmeanings_id_2: 			songmeaningsIds.length >= 2 ? songmeaningsIds[1] : null, 
				songmeanings_id_3: 			songmeaningsIds.length >= 3 ? songmeaningsIds[2] : null, 
				songmeanings_id_4: 			songmeaningsIds.length >= 4 ? songmeaningsIds[3] : null, 
				songmeanings_id_5: 			songmeaningsIds.length >= 5 ? songmeaningsIds[4] : null, 

				spotifymm_id_1: 				spotifyIds.length >= 1 ? spotifyIds[0] : null, 
				spotifymm_id_2: 				spotifyIds.length >= 2 ? spotifyIds[1] : null, 
				spotifymm_id_3: 				spotifyIds.length >= 3 ? spotifyIds[2] : null, 
				spotifymm_id_4: 				spotifyIds.length >= 4 ? spotifyIds[3] : null, 
				spotifymm_id_5: 				spotifyIds.length >= 5 ? spotifyIds[4] : null, 

				key: 										track ? track.key : null, 
				energy: 								track ? track.energy : null, 
				liveness: 							track ? track.liveness : null, 
				tempo: 									track ? track.tempo : null, 
				speechiness: 						track ? track.speechiness : null, 
				acousticness: 					track ? track.acousticness : null,
				mode: 									track ? track.mode : null,
				timesignature: 					track ? track.timesignature : null,
				duration: 							track ? track.duration : null,
				loudness: 							track ? track.loudness : null,
				valence: 								track ? track.valence : null,
				danceability: 					track ? track.danceability : null,
				timesignature: 					track ? track.time_signature : null,

				type: 								types,

				date: 								new Date()
			}));
		});
		return this;
	},


	getTypesString: function(typesArray) {
		var types = '';
		
		if(!typesArray || !_.isArray(typesArray))
			return types;

		for (var i = 0; i < typesArray.length; i++)
			types += (typesArray[i].name + ',');
		
		return types.slice(0, -1);
	}
});

module.exports = SongCollection;