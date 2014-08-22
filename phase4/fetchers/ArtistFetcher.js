var querystring = require('querystring');
var url = require('url');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').lastFm;
var _ = require('underscore');

/**
 * LastFM Artist fetcher.
 */
var ArtistFetcher = function(artist) {
	this.artist = artist;
};


ArtistFetcher.prototype = {

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


	makeRequest: function(options) {
		var self = this;
		return request(options).then(function(response) {

			var error = self.getErrorFromResponse(response);

			if(error)
				throw (error + '. On phase 4 for artist: ' + self.artist.name || self.artist.musicbrainz_id)

			else
				return response;
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
	},


	getErrorFromResponse: function(response) {
		var parsedResponse = JSON.parse(response[1]);

		if (!parsedResponse)
			return 'Missing response from LastFm.';

		if (parsedResponse.error)
			return this.errors[parsedResponse.error];

		return false;
	},


	errors: {
		2: 'Invalid service - This service does not exist',
		3: 'Invalid Method - No method with that name in this package',
		4: 'Authentication Failed - You do not have permissions to access the service',
		5: 'Invalid format - This service doesn\'t exist in that format',
		6: 'Invalid parameters - Your request is missing a required parameter',
		7: 'Invalid resource specified',
		8: 'Operation failed - Something else went wrong',
		9: 'Invalid session key - Please re-authenticate',
		10: 'Invalid API key - You must be granted a valid key by last.fm',
		11: 'Service Offline - This service is temporarily offline. Try again later.',
		13: 'Invalid method signature supplied',
		16: 'There was a temporary error processing your request. Please try again',
		26: 'Suspended API key - Access for your account has been suspended, please contact Last.fm',
		29: 'Rate limit exceeded - Your IP has made too many requests in a short period'
	}
}

module.exports = ArtistFetcher;