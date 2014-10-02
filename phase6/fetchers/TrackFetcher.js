var querystring = require('querystring');
var url = require('url');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').lastFm;
var _ = require('underscore');
var lastFmFetcher = require('../../base/fetchers/lastFmFetcher');

/**
 * LastFM Track fetcher. Inherits from lastFmFetcher
 */
var TrackFetcher = function(track) {
	this.track = track;
};


TrackFetcher.prototype = _.extend({}, lastFmFetcher, {

	url: 'http://ws.audioscrobbler.com/2.0/',
	retryLimit: 5,

	fetch: function() {
		var self = this;
		var clean = _.bind(this.resetGlobalRequestParameters, this);
		this.rawTrack = {};
		clean();
		return Promise.resolve(keymaster.getKey())

		.then(function(key) {
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
			return self.makeRequest(self.generateSimilarRequest(key))
			.then(_.bind(self.onSimilarRequestDone, self));;
		})

		.then(function() {
			if(self.track.artist_musicbrainz_id && !_.isEmpty(self.track.artist_musicbrainz_id))
				self.rawTrack.artist_musicbrainz_id = self.track.artist_musicbrainz_id

			if(self.track.artist_name && !_.isEmpty(self.track.artist_name))
				self.rawTrack.artist_name = self.track.artist_name

			if(self.track.musicbrainz_id && !_.isEmpty(self.track.musicbrainz_id))
				self.rawTrack.mbid = self.track.musicbrainz_id

			if(self.track.name && !_.isEmpty(self.track.name))
				self.rawTrack.name = self.track.name

			return self.rawTrack;
		});
	},


	/** Request generators */

	generateTopTagsRequest: function(key) {
		return this._generateRequest('track.getTopTags', key);
	},
	generateTopFansRequest: function(key) {
		return this._generateRequest('track.getTopFans', key);
	},
	generateSimilarRequest: function(key) {
		return this._generateRequest('track.getSimilar', key);
	},

	_generateRequest: function(methodName, key) {
		var parameters = _.extend({ method: methodName}, this.getBaseOptions(key));
		return { url: url.parse(this.url + '?' + querystring.stringify(parameters)) };
	},


	/** Success callbacks */

	onTopTagsRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateTopTagsRequest(key)).then(_.bind(self.onTopTagsRequestDone, self));
			}); 
		}

		if (_.isEmpty(JSON.parse(response[1])) || !_.isArray(JSON.parse(response[1]).toptags.tag))
			return;

		this.rawTrack.topTags = this.rawTrack.topTags || [];
		this.rawTrack.topTags = this.rawTrack.topTags.concat(JSON.parse(response[1]).toptags.tag);
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
			return;

		this.rawTrack.topFans = this.rawTrack.topFans || [];
		this.rawTrack.topFans = this.rawTrack.topFans.concat(JSON.parse(response[1]).topfans.user);
	},


	onSimilarRequestDone: function(response) {
		var self = this;

		if (_.isNull(response)) { // null response indicates we need to retry
			this.retryCount++;
			return Promise.resolve(keymaster.getKey()).then(function(key) {
				return self.makeRequest(self.generateSimilarRequest(key)).then(_.bind(self.onSimilarRequestDone, self));
			}); 
		}

		if (_.isEmpty(JSON.parse(response[1])) || !_.isArray(JSON.parse(response[1]).similartracks.track))
			return;
		
		this.rawTrack.similar = JSON.parse(response[1]).similartracks.track;
	},




	/** Helpers */

	getBaseOptions: function(key) {
		console.log('Key used: ' + key + ', ' + new Date().toISOString());
		var requestOptions = { api_key: key, format: 'json', artist: this.track.artist_name };

		if(this.track.musicbrainz_id)
			requestOptions.mbid = this.track.musicbrainz_id;
		else
			requestOptions.track = this.track.name;

		return requestOptions;
	},
	
	resetGlobalRequestParameters: function() {
		this.biteSize = 100;
		this.page = 0;
		this.retryCount = 0;
	},

	getTrackString: function() {
		return 'name: ' + (this.track.name || 'none') + ', id: ' +  (this.track.musicbrainz_id || 'none');
	}
});

module.exports = TrackFetcher;