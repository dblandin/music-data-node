var querystring = require('querystring');
var url = require('url');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').lastFm;
var _ = require('underscore');
var lastFmFetcher = require('../../base/fetchers/lastFmFetcher');

/**
 * lastFm Artist scraper. Inherits from lastFmFetcher.
 */
var ArtistScraper = function(query) {
	this.query = query;
};


ArtistScraper.prototype = _.extend({}, lastFmFetcher, {

	url: 'http://ws.audioscrobbler.com/2.0/',
	retryLimit: 5,

	fetch: function() {
		var self = this;
		var clean = _.bind(this.resetGlobalRequestParameters, this);
		this.rawArtists = [];
		clean();
		return Promise.resolve(keymaster.getKey())

		.then(keymaster.getKey).then(function(key) {
			return self.makeRequest(self.generateArtistPaginationRequest(key))
			.then(_.bind(self.onArtistPaginationRequestDone, self));
		})

		.then(function() {
			return self.rawArtists;
		});
	},


	/** Request generators */

	generateArtistPaginationRequest: function(key) {
		return { url: url.parse(this.url + '?' + this.getArtistPaginationQueryString(key)) };
	},


	/** Query string generators */

	getArtistPaginationQueryString: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		return querystring.stringify({ 
			method: 'artist.search',
			page: this.page,
			limit: this.biteSize,
			artist: this.query,
			api_key: key,
			format: 'json'
		});
	},


	/** Success callbacks */

	onArtistPaginationRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateArtistPaginationRequest(key)).then(_.bind(self.onArtistPaginationRequestDone, self));
			}); 
		}

		if (_.isEmpty(JSON.parse(response[1])) 
			|| !JSON.parse(response[1]).results
			|| !JSON.parse(response[1]).results.artistmatches)
			return;

		var rawResponseArray = JSON.parse(response[1]).results.artistmatches.artist;
		var responseArray = _.map(rawResponseArray, function(artist) { 
			artist = artist || {};
			return {name: artist.name, mbid: artist.mbid}; 
		});

		var totalResultsString = JSON.parse(response[1]).results['opensearch:totalResults'];
		var totalResults = parseInt(totalResultsString);

		var shouldContinuePagination = !!(totalResults && !_.isNaN(totalResults)) ? totalResults > this.rawArtists.length : responseArray && responseArray.length && responseArray.length === this.biteSize;

		if (_.isArray(responseArray)) {
			this.rawArtists = this.rawArtists || [];
			this.rawArtists = this.rawArtists.concat(responseArray);
		}

		if(shouldContinuePagination) {
			this.page++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateArtistPaginationRequest(key)).then(_.bind(self.onArtistPaginationRequestDone, self));
			}); 
		}
	},


	/** Helpers */

	resetGlobalRequestParameters: function() {
		this.biteSize = 100;
		this.page = 0;
		this.retryCount = 0;
	}
});

module.exports = ArtistScraper;