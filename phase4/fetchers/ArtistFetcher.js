var querystring = require('querystring');
var url = require('url');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').lastFm;
var _ = require('underscore');
var lastFmFetcher = require('../../base/fetchers/lastFmFetcher');

/**
 * LastFM Artist fetcher.
 */
var ArtistFetcher = function(artist) {
	this.artist = artist;
};


ArtistFetcher.prototype = _.extend({}, lastFmFetcher, {

	url: 'http://ws.audioscrobbler.com/2.0/',


	fetch: function(callback) {
		var self = this;		
		var rawArtist;

		return Promise.resolve(keymaster.getKey())

		.then(function(key) {

			return self.makeRequest(self.generateArtistInfoRequest(key)).then(function(response) {
				
				var artist = JSON.parse(response[1]).artist;
				if(artist && !_.isEmpty(artist))
					rawArtist =  artist;

				else throw ('Artist not found (phase 4): ' + self.artist.name || self.artist.musicbrainz_id)
			});
		})

		.then(keymaster.getKey)

		.then(function(key) {
			return self.makeRequest(self.generateSimilarRequest(key)).then(function(response) {
				rawArtist.similar = JSON.parse(response[1]).similarartists.artist;
			});;
		})

		.then(function() {
			return rawArtist;
		});
	},


	generateArtistInfoRequest: function(key) {
		return {
			url: url.parse(this.url + '?' + this.getArtistInfoQueryString(key))
		};
	},


	generateSimilarRequest: function(key) {
		return {
			url: url.parse(this.url + '?' + this.getSimilarQueryString(key))
		};
	},


	getArtistInfoQueryString: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		return querystring.stringify({

			method: 'artist.getinfo',
			api_key: key,
			mbid: this.artist.musicbrainz_id,
			format: 'json'
	
		});
	},


	getSimilarQueryString: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		return querystring.stringify({

			method: 'artist.getsimilar',
			api_key: key,
			mbid: this.artist.musicbrainz_id,
			format: 'json'
	
		});
	}
});

module.exports = ArtistFetcher;