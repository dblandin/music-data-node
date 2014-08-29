var querystring = require('querystring');
var url = require('url');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').echonest;
var _ = require('underscore');
var echonestFetcher = require('../../base/fetchers/echonestFetcher');

/**
 * Echonest Artist scraper. Inherits from echonestFetcher.
 */
var ArtistScraper = function(query) {
	this.query = query;
	this.biteSize = 100;
};


ArtistScraper.prototype = _.extend({}, echonestFetcher, {

	url: 'http://developer.echonest.com/api/v4/artist/',


	fetch: function() {
		var self = this;		
		var paginateThroughArtists = _.bind(this.paginateThroughArtists, this);

		this.page = 1;
		this.rawArtists = [];

		return Promise.resolve(paginateThroughArtists())

		.then(function() {
			if(self.rawArtists && !_.isEmpty(self.rawArtists))
				return self.rawArtists;
			else
				throw('No artists found for query ' + this.query);
		});
	},


	paginateThroughArtists: function() {
		var self = this;
		return Promise.resolve(keymaster.getKey())

			.then(function(key) { 
				return self.makeRequest(self.generateSearchRequest(key));
			})

			.then(_.bind(this.onRequestDone, this));
	},


	onRequestDone: function(response) {
		var response = JSON.parse(response[1]).response;
		var artists = response.artists;

		if (this.requestFoundArtists(response)) {
			this.rawArtists = _.union(this.rawArtists, response.artists);
			this.page++;

			if(artists.length === this.biteSize)
				return this.paginateThroughArtists();
		}
	},


	generateSearchRequest: function(key) {
		return {
			url: url.parse(this.url + 'search?' + this.getSearchQueryString(key))
		};
	},


	getSearchQueryString: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		return querystring.stringify({

			api_key: key,
			format: 'json',
			name: this.query,
			results: this.biteSize,
			start: (this.page - 1) * this.biteSize,
			bucket: [
				'id:musicbrainz'
			]
		});
	},


	requestFoundArtists: function(response) {
		return response.artists && _.isArray(response.artists) && !_.isEmpty(response.artists);
	}
});

module.exports = ArtistScraper;