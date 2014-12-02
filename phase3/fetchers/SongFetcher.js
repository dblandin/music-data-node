var querystring = require('querystring');
var url = require('url');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').echonest;
var _ = require('underscore');
var echonestFetcher = require('../../base/fetchers/echonestFetcher');

/**
 * Song fetcher. Inherits from echonestFetcher.
 */
var SongFetcher = function(artist) {
	this.artist = artist;
	this.biteSize = 100;
};


SongFetcher.prototype = _.extend({}, echonestFetcher, {

	url: 'http://developer.echonest.com/api/v4/song/',


	fetch: function() {
		this.songs = [];
		this.page = 0;
		var paginateThroughSongs = _.bind(this.paginateThroughSongs, this);
		var self = this;

		return Promise.resolve(paginateThroughSongs())

		.then(function() {
			return self.songs;
		});
	},


	paginateThroughSongs: function() {
		var self = this;
		return Promise.resolve(keymaster.getKey())

			.then(function(key) { 
				return self.makeRequest(self.generateSearchRequestOptions(key));
			})

			.then(_.bind(this.onRequestDone, this));
	},


	onRequestDone: function(response) {
		var response = JSON.parse(response[1]).response;
		var songs = response.songs;
		
		if (songs && !_.isEmpty(songs)) {
			this.songs = this.songs.concat(songs);
			this.page++;

			if (songs.length === this.biteSize && this.page < 10)
				return this.paginateThroughSongs();
		}
	},


	generateSearchRequestOptions: function(key) {
		return {
			url: url.parse(this.url + 'search?' + this.getSearchQueryString(key))
		};
	},


	getSearchQueryString: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		return querystring.stringify({

			api_key: key,
			format: 'json',
			artist_id: this.artist.echonest_id, // TODO support when we don't have the id
			results: this.page === 9 ? this.biteSize - 1 : this.biteSize,
			start: this.page * this.biteSize,
			bucket: [
				'song_currency',
				'song_hotttnesss',
				'song_type',
				'audio_summary',
				'id:lyricfind-US', 
				'id:whosampled', 
				'id:songmeanings', 
				'id:spotify'
			]
		});
	}
});

module.exports = SongFetcher;