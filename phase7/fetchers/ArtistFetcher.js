var Promise = require('bluebird');
var _ = require('underscore');
var musicbrainz = require('../../base/musicbrainzUtil');

/**
 * Musicbrainz artist fetcher. Inherits from lastFmFetcher
 */
var ArtistFetcher = function(artist) {
	this.artist = artist;
};


ArtistFetcher.prototype = {

	// Default set at musicbrainzUtil
	biteSize: 100,


	fetch: function() {
		var self = this;
		var clean = _.bind(this.resetGlobalRequestParameters, this);

		this.rawArtist = {};
		clean();

		return Promise.resolve(musicbrainz.artistAsync(this.artist.musicbrainz_id, {}))

		.then(_.bind(self.onArtistRequestDone, self))

		.then(function() {
			clean();
			return musicbrainz.searchAsync('release-group', self.getSearchArgs())
			.then(_.bind(self.onReleaseGroupRequestDone, self));
		})

		.then(function() {
			clean();
			return musicbrainz.searchAsync('release', self.getSearchArgs())
			.then(_.bind(self.onReleaseRequestDone, self));
		})

		.then(function() {
			clean();
			return musicbrainz.searchAsync('work', self.getSearchArgs())
			.then(_.bind(self.onWorkRequestDone, self));
		})

		.then(function() {
			return self.rawArtist;
		})
	},

	onArtistRequestDone: function(response) {
		if (!_.isObject(response)) throw ('Artist ' + this.getArtistString() + ' was not found');
		this.rawArtist = response;
	},

	onReleaseGroupRequestDone: function(response) {
		if(!_.isObject(response)) return;

		this.rawArtist.releaseGroups = this.rawArtist.releaseGroups || [];
		this.rawArtist.releaseGroups = this.rawArtist.releaseGroups.concat(response['release-groups'] || []);

		if(_.isArray(response['release-groups']) && response['release-groups'].length === this.biteSize) {
			this.page++;
			return musicbrainz.searchAsync('release-group', this.getSearchArgs() )
			.then(_.bind(this.onReleaseGroupRequestDone, this));
		}
	},

	onReleaseRequestDone: function(response) {
		if(!_.isObject(response)) return;

		this.rawArtist.releases = this.rawArtist.releases || [];
		this.rawArtist.releases = this.rawArtist.releases.concat(response.releases || []);

		if(_.isArray(response.releases) && response.releases.length === this.biteSize) {
			this.page++;
			return musicbrainz.searchAsync('release', this.getSearchArgs() )
			.then(_.bind(this.onReleaseRequestDone, this));
		}
	},

	onWorkRequestDone: function(response) {
		if(!_.isObject(response)) return;

		this.rawArtist.works = this.rawArtist.works || [];
		this.rawArtist.works = this.rawArtist.works.concat(response.works || []);

		if(_.isArray(response.works) && response.works.length === this.biteSize) {
			this.page++;
			return musicbrainz.searchAsync('work', this.getSearchArgs() )
			.then(_.bind(this.onWorkRequestDone, this));
		}
	},


	getSearchArgs: function() {
		return { arid: this.artist.musicbrainz_id, offset: this.page * this.biteSize };
	},


	resetGlobalRequestParameters: function() {
		this.page = 0;
	},


	getArtistString: function() {
		return 'name: ' + (this.artist.name || 'none') + ', id: ' +  (this.artist.musicbrainz_id || 'none');
	}
};

module.exports = ArtistFetcher;