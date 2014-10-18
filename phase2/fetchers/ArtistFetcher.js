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
		this.rawArtist = {};

		return Promise.resolve(keymaster.getKey())

		.then(function(key) {
			return self.makeRequest(self.generateProfileRequest(key))
			.then(_.bind(self.onProfileRequestDone, self));
		})

		.then(keymaster.getKey).then(function(key) {
			return self.makeRequest(self.generateSimilarRequest(key))
			.then(_.bind(self.onSimilarRequestDone, self));
		})

		.then(keymaster.getKey).then(function(key){ 
			return self.makeRequest(self.generateOldSimilarRequest(key))
			.then(_.bind(self.onOldSimilarRequestDone, self));
		})

		.then(keymaster.getKey).then(function(key) {
			return self.makeRequest(self.generateNewSimilarRequest(key))
			.then(_.bind(self.onNewSimilarRequestDone, self));
		})

		.then(function() {
			return self.rawArtist;
		});
	},

	/** Request generators */
	generateProfileRequest: function(key) {
		return { url: url.parse(this.url + 'profile?' + this.getProfileQueryString(key)) };
	},
	generateSimilarRequest: function(key) {
		return { url: url.parse(this.url + 'similar?' + this.getSimilarQueryString(key)) };
	},
	generateOldSimilarRequest: function(key) {
		return { url: url.parse(this.url + 'similar?' + this.getOldSimilarQueryString(key)) };
	},
	generateNewSimilarRequest: function(key) {
		return { url: url.parse(this.url + 'similar?' + this.getNewSimilarQueryString(key)) };
	},
	


	/** Success callbacks */
	onProfileRequestDone: function(response) {
		var response = JSON.parse(response[1]).response;

		if (response && response.artist && !_.isEmpty(response.artist))
			this.rawArtist = response.artist;
		else 
			throw('Artist not found (phase 2): ' + this.artist.name || this.artist.echonest_id);
	},

	onSimilarRequestDone: function(response) {
		this.rawArtist.similar = JSON.parse(response[1]).response.artists;
	},

	onOldSimilarRequestDone: function(response) {
		this.rawArtist.oldSimilar = JSON.parse(response[1]).response.artists;
	},

	onNewSimilarRequestDone: function(response) {
		this.rawArtist.newSimilar = JSON.parse(response[1]).response.artists;
	},


	/** Query string generators */
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
		var options = {
			api_key: key,
			format: 'json',
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
		};
		if(this.artist.echonest_id)
			options.id = this.artist.echonest_id;
		else
			options.name = this.artist.name;
		return querystring.stringify(options);
	},
	getSimilarQueryStringObject: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		var options = {
			api_key: key,
			format: 'json',
			results: 100,
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
		if(this.artist.echonest_id)
			options.id = this.artist.echonest_id;
		else
			options.name = this.artist.name;
		return options;
	}
});

module.exports = ArtistFetcher;