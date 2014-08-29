var querystring = require('querystring');
var url = require('url');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').echonest;
var _ = require('underscore');
var echonestFetcher = require('../../base/fetchers/echonestFetcher');

/**
 * Echonest Artist fetcher. Inherits from echonestFetcher.
 */
var ArtistFetcher = function(artist) {
	this.artist = artist;
};


ArtistFetcher.prototype = _.extend({}, echonestFetcher, {

	url: 'http://developer.echonest.com/api/v4/artist/',


	fetch: function(callback) {
		var self = this;		
		var rawArtist;

		return Promise.resolve(keymaster.getKey())

		.then(function(key) {

			return self.makeRequest(self.generateProfileRequest(key)).then(function(response) {

				var response = JSON.parse(response[1]).response;

				if (self.requestFoundArtist(response))
					rawArtist = response.artist;

				else throw('Artist not found (phase 2): ' + self.artist.name || self.artist.echonest_id);
			});
		})

		.then(keymaster.getKey)

		.then(function(key) {
			return self.makeRequest(self.generateSimilarRequest(key)).then(function(response) {
				rawArtist.similar = JSON.parse(response[1]).response.artists;
			});
		})

		.then(keymaster.getKey)

		.then(function(key){ 
			return self.makeRequest(self.generateOldSimilarRequest(key)).then(function(response) {
				rawArtist.oldSimilar = JSON.parse(response[1]).response.artists;
			});
		})

		.then(keymaster.getKey)

		.then(function(key) {
			return self.makeRequest(self.generateNewSimilarRequest(key)).then(function(response) {
				rawArtist.newSimilar = JSON.parse(response[1]).response.artists;
			});
		})

		.then(function() {
			return rawArtist;
		});
	},


	generateProfileRequest: function(key) {
		return {
			url: url.parse(this.url + 'profile?' + this.getProfileQueryString(key))
		};
	},


	generateSimilarRequest: function(key) {
		return {
			url: url.parse(this.url + 'similar?' + this.getSimilarQueryString(key))
		};
	},


	generateOldSimilarRequest: function(key) {
		return {
			url: url.parse(this.url + 'similar?' + this.getOldSimilarQueryString(key))
		};
	},


	generateNewSimilarRequest: function(key) {
		return {
			url: url.parse(this.url + 'similar?' + this.getNewSimilarQueryString(key))
		};
	},


	getSimilarQueryString: function(key) {
		return querystring.stringify(this.getSimilarQueryStringObject(key));
	},
	

	getOldSimilarQueryString: function(key) {
		var queryStringObject = this.getSimilarQueryStringObject(key);
		queryStringObject.artist_start_year_before = 1970;

		return querystring.stringify(queryStringObject);
	},
	

	getNewSimilarQueryString: function(key) {
		var queryStringObject = this.getSimilarQueryStringObject(key);
		queryStringObject.artist_start_year_after = 1969;
		
		return querystring.stringify(queryStringObject);
	},


	getProfileQueryString: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		return querystring.stringify({

			api_key: key,
			format: 'json',
			name: this.artist.echonest_id,
			bucket: [
				'familiarity', 
				'discovery', 
				'artist_location', 
				'years_active',
				'terms',
				'genre',
				'biographies',
				'reviews',
				'hotttnesss',
				'id:musicbrainz', 
				'id:whosampled', 
				'id:discogs', 
				'id:songkick', 
				'id:songmeanings', 
				'id:spotify'
			]
		});
	},


	getSimilarQueryStringObject: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		return {

			api_key: key,
			format: 'json',
			results: 100,
			name: this.artist.echonest_id,
			bucket: [
				'familiarity_rank',
				'hotttnesss_rank',
				'id:musicbrainz', 
				'id:whosampled', 
				'id:discogs', 
				'id:songkick', 
				'id:songmeanings', 
				'id:spotify'
			]
		};
	},


	requestFoundArtist: function(response) {
		return response.artist && !_.isEmpty(response.artist);
	}
});

module.exports = ArtistFetcher;