var querystring = require('querystring');
var url = require('url');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').lastFm;
var _ = require('underscore');
var lastFmFetcher = require('../../base/fetchers/lastFmFetcher');

/**
 * LastFM Album fetcher. Inherits from lastFmFetcher
 */
var AlbumFetcher = function(album) {
	this.album = album;
};


AlbumFetcher.prototype = _.extend({}, lastFmFetcher, {

	url: 'http://ws.audioscrobbler.com/2.0/',
	retryLimit: 5,

	fetch: function() {
		var self = this;
		var clean = _.bind(this.resetGlobalRequestParameters, this);
		this.rawAlbum = {};
		clean();
		return Promise.resolve(keymaster.getKey())

		.then(function(key) {
			return self.makeRequest(self.generateAlbumInfoRequest(key))
			.then(_.bind(self.onAlbumInfoRequestDone, self));
		})

		.then(keymaster.getKey).then(function(key) {
			clean();
			return self.makeRequest(self.generateTopTagsRequest(key))
			.then(_.bind(self.onTopTagsRequestDone, self));
		})

		.then(function() {
			if(self.album.artist_musicbrainz_id && !_.isEmpty(self.album.artist_musicbrainz_id))
				self.rawAlbum.artist_musicbrainz_id = self.album.artist_musicbrainz_id
			return self.rawAlbum;
		});
	},


	/** Request generators */

	generateAlbumInfoRequest: function(key) {
		var parameters = _.extend({ method: 'album.getInfo' }, this.getBaseOptions(key));
		return { url: url.parse(this.url + '?' + querystring.stringify(parameters)) };
	},

	generateTopTagsRequest: function(key) {
		var parameters = _.extend({ method: 'artist.getTopTags'	}, this.getBaseOptions(key));
		return { url: url.parse(this.url + '?' + querystring.stringify(parameters)) };
	},


	/** Success callbacks */

	onAlbumInfoRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateAlbumInfoRequest(key)).then(_.bind(self.onAlbumInfoRequestDone, self));
			}); 
		}

		var album = JSON.parse(response[1]).album;
		if(album && !_.isEmpty(album))
			this.rawAlbum =  album;

		else throw ('Artist not found (phase 4): ' + self.getAlbumString());
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

		this.rawAlbum.topTags = this.rawAlbum.topTags || [];
		this.rawAlbum.topTags = this.rawAlbum.topTags.concat(JSON.parse(response[1]).toptags.tag);
	},


	/** Helpers */

	getBaseOptions: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		var requestOptions = { api_key: key, format: 'json', artist: this.album.artist_name };

		if(this.album.musicbrainz_id)
			requestOptions.mbid = this.album.musicbrainz_id;
		else
			requestOptions.album = this.album.name;

		return requestOptions;
	},
	
	resetGlobalRequestParameters: function() {
		this.biteSize = 100;
		this.page = 0;
		this.retryCount = 0;
	},

	getAlbumString: function() {
		return 'name: ' + (this.album.name || 'none') + ', id: ' +  (this.album.musicbrainz_id || 'none');
	}
});

module.exports = AlbumFetcher;