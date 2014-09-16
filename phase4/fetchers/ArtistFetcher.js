var querystring = require('querystring');
var url = require('url');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').lastFm;
var _ = require('underscore');
var lastFmFetcher = require('../../base/fetchers/lastFmFetcher');

/**
 * LastFM Artist fetcher. Inherits from lastFmFetcher
 */
var ArtistFetcher = function(artist) {
	this.artist = artist;
};


ArtistFetcher.prototype = _.extend({}, lastFmFetcher, {

	url: 'http://ws.audioscrobbler.com/2.0/',
	retryLimit: 5,

	fetch: function() {
		var self = this;
		var clean = _.bind(this.resetGlobalRequestParameters, this);
		this.rawArtist = {};
		clean();
		return Promise.resolve(keymaster.getKey())

		.then(function(key) {
			return self.makeRequest(self.generateArtistInfoRequest(key))
			.then(_.bind(self.onArtistInfoRequestDone, self));
		})

		.then(keymaster.getKey).then(function(key) {
			clean();
			return self.makeRequest(self.generateSimilarRequest(key))
			.then(_.bind(self.onSimilarRequestDone, self));
		})

		.then(keymaster.getKey).then(function(key) {
			clean();
			return self.makeRequest(self.generateTopAlbumsRequest(key))
			.then(_.bind(self.onTopAlbumsRequestDone, self));
		})

		.then(keymaster.getKey).then(function(key) {
			clean();
			return self.makeRequest(self.generateTopTagsRequest(key))
			.then(_.bind(self.onTopTagsRequestDone, self));
		})

		.then(keymaster.getKey).then(function(key) {
			clean();
			return self.makeRequest(self.generateTopFansRequest(key))
			.then(_.bind(self.onTopFansRequestDone, self));
		})

		.then(keymaster.getKey).then(function(key) {
			clean();
			return self.makeRequest(self.generateTopTracksRequest(key))
			.then(_.bind(self.onTopTracksRequestDone, self));
		})

		.then(function() {
			return self.rawArtist;
		});
	},


	/** Request generators */

	generateArtistInfoRequest: function(key) {
		return { url: url.parse(this.url + '?' + this.getArtistInfoQueryString(key)) };
	},

	generateSimilarRequest: function(key) {
		return { url: url.parse(this.url + '?' + this.getSimilarQueryString(key)) };
	},

	generateTopAlbumsRequest: function(key) {
		return { url: url.parse(this.url + '?' + this.getTopAlbumsQueryString(key)) };
	},

	generateTopTagsRequest: function(key) {
		return { url: url.parse(this.url + '?' + this.getTopTagsQueryString(key)) };
	},

	generateTopFansRequest: function(key) {
		return { url: url.parse(this.url + '?' + this.getTopFansQueryString(key)) };
	},

	generateTopTracksRequest: function(key) {
		return { url: url.parse(this.url + '?' + this.getTopTracksQueryString(key)) };
	},


	/** Query string generators */

	getArtistInfoQueryString: function(key) {
		return querystring.stringify(_.extend({ method: 'artist.getInfo' }, this.getBaseOptions(key)));
	},

	getSimilarQueryString: function(key) {
		return querystring.stringify(_.extend({ method: 'artist.getSimilar' }, this.getBaseOptions(key)));
	},

	getTopAlbumsQueryString: function(key) {
		return querystring.stringify(_.extend({ 
			method: 'artist.getTopAlbums',
			page: this.page,
			limit: this.biteSize
		}, this.getBaseOptions(key)));
	},

	getTopTagsQueryString: function(key) {
		return querystring.stringify(_.extend({ method: 'artist.getTopTags'	}, this.getBaseOptions(key)));
	},

	getTopFansQueryString: function(key) {
		return querystring.stringify(_.extend({ method: 'artist.getTopFans'	}, this.getBaseOptions(key)));
	},

	getTopTracksQueryString: function(key) {
		return querystring.stringify(_.extend({ 
			method: 'artist.getTopTracks',
			page: this.page,
			limit: this.biteSize
		}, this.getBaseOptions(key)));
	},


	/** Success callbacks */

	onArtistInfoRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateArtistInfoRequest(key)).then(_.bind(self.onArtistInfoRequestDone, self));
			}); 
		}

		var artist = JSON.parse(response[1]).artist;
		if(artist && !_.isEmpty(artist))
			this.rawArtist =  artist;

		else throw ('Artist not found (phase 4): ' + (self.artist.name || self.artist.musicbrainz_id))
	},

	onSimilarRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateSimilarRequest(key)).then(_.bind(self.onSimilarRequestDone, self));
			}); 
		}

		if (_.isEmpty(JSON.parse(response[1])) || !_.isArray(JSON.parse(response[1]).similarartists.artist))
			return;
		
		this.rawArtist.similar = JSON.parse(response[1]).similarartists.artist;
	},

	onTopAlbumsRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateTopAlbumsRequest(key)).then(_.bind(self.onTopAlbumsRequestDone, self));
			}); 
		}

		if (_.isEmpty(JSON.parse(response[1])))
			return;

		var responseArray = JSON.parse(response[1]).topalbums.album;
		var attrs = JSON.parse(response[1]).topalbums['@attr'];
		var shouldContinuePagination = !!(attrs && attrs.totalPages) ? parseInt(attrs.totalPages) > this.page : responseArray && responseArray.length && responseArray.length === this.biteSize;

		if (_.isArray(responseArray)) {
			this.rawArtist.topAlbums = this.rawArtist.topAlbums || [];
			this.rawArtist.topAlbums = this.rawArtist.topAlbums.concat(responseArray);
		}

		if(shouldContinuePagination) {
			this.page++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateTopAlbumsRequest(key)).then(_.bind(self.onTopAlbumsRequestDone, self));
			}); 
		}
	},

	onTopTagsRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateTopTagsRequest(key)).then(_.bind(self.onTopTagsRequestDone, self));
			}); 
		}

		if (_.isEmpty(JSON.parse(response[1])) || !_.isArray(JSON.parse(response[1]).toptags.tag))
			return

		this.rawArtist.topTags = this.rawArtist.topTags || [];
		this.rawArtist.topTags = this.rawArtist.topTags.concat(JSON.parse(response[1]).toptags.tag);
	},

	onTopFansRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateTopFansRequest(key)).then(_.bind(self.onTopFansRequestDone, self));
			}); 
		}

		if (_.isEmpty(JSON.parse(response[1])) || !_.isArray(JSON.parse(response[1]).topfans.user))
			return

		this.rawArtist.topFans = this.rawArtist.topFans || [];
		this.rawArtist.topFans = this.rawArtist.topFans.concat(JSON.parse(response[1]).topfans.user);
	},

	onTopTracksRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateTopTracksRequest(key)).then(_.bind(self.onTopTracksRequestDone, self));
			}); 
		}

		if (_.isEmpty(JSON.parse(response[1])))
			return;

		var self = this;
		var responseArray = JSON.parse(response[1]).toptracks.track;
		var attrs = JSON.parse(response[1]).toptracks['@attr'];
		var shouldContinuePagination = !!(attrs && attrs.totalPages) ? parseInt(attrs.totalPages) > this.page : responseArray && responseArray.length && responseArray.length === this.biteSize;

		if (_.isArray(responseArray)) {
			this.rawArtist.topTracks = this.rawArtist.topTracks || [];
			this.rawArtist.topTracks = this.rawArtist.topTracks.concat(responseArray);
		}

		if(shouldContinuePagination) {
			this.page++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateTopTracksRequest(key)).then(_.bind(self.onTopTracksRequestDone, self));
			}); 
		}
	},


	/** Helpers */

	getBaseOptions: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		var requestOptions = { api_key: key, format: 'json' };

		if(this.artist.musicbrainz_id)
			requestOptions.mbid = this.artist.musicbrainz_id;
		else
			requestOptions.artist = this.artist.name;

		return requestOptions;
	},
	
	shouldContinuePagination: function(response, property) {
		var responseArray = JSON.parse(response[1])[property.toLowerCase()];
		var attributes = responseArray['@attr'];

		if(attributes && attributes.totalPages)
			return parseInt(attributes.totalPages) > this.page;

		else
			return responseArray.length === this.biteSize;
	},

	resetGlobalRequestParameters: function() {
		this.biteSize = 100;
		this.page = 0;
		this.retryCount = 0;
	}
});

module.exports = ArtistFetcher;