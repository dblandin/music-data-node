var logger = require('../base/logManager').getLoggerForFile('./phase7/logs/phase7.log');
var chalk = require('chalk');
var ArtistFetcher = require('./fetchers/ArtistFetcher');
var Promise = require('bluebird');
var bookshelf = require('../base/bookshelf');
var util = require('../base/utilities');
var _ = require('underscore');

var Artist = require('./models/Artist');
var ArtistReleaseRelationCollection = require('./models/ArtistReleaseRelationCollection');
var ArtistWorkRelationCollection = require('./models/ArtistWorkRelationCollection');
var ReleaseGroupCollection = require('./models/ReleaseGroupCollection');
var WorkCollection = require('./models/WorkCollection');
var WorkWorkRelationCollection = require('./models/WorkWorkRelationCollection');

/**
 * Track worker
 */
var ArtistWorker = function(artist) {
	this.artist = artist;
};

ArtistWorker.prototype = {


	start: function(callback) {
		var self  = this;
		this.done = callback;

		try {
			return Promise.resolve(this.fetchArtistIfValid())

			.error(function(error) {
				logger.error(self.getArtistString() + ' - ' + util.getErrorString(error));
			})

			.catch(function(exception) {
				logger.error(self.getArtistString() + ' - ' + util.getErrorString(exception));
			})

			.finally(function() {
				self.done();
			})
			
		}
		catch(e) {
			logger.error(self.getArtistString() + ' - ' + util.getErrorString(e));
			this.done();
		}
	},


	fetchArtistIfValid: function() {
		var self = this;

		if(!this.artist.musicbrainz_id && !this.artist.name)
			throw('No musicbrainz_id or name for artist on phase 7');

		return Promise.resolve(this.shouldSaveArtist())

		.then(function(shouldFetch) {
		
			if(!shouldFetch)
				console.log(chalk.blue.bold('Artist ' + self.getArtistString() + ' has been already fetched.'));

			else {
				var artistFetcher = new ArtistFetcher(self.artist);
				
				return Promise.resolve(artistFetcher.fetch())

				.then(function(rawTrack) {
					return self.save(rawTrack);
				});
			}
		});
	},

	save: function(rawTrack) {
		var self = this;

		var artist = new Artist().extractFromRawResponse(rawTrack);
		var artistReleaseRelationCollection = new ArtistReleaseRelationCollection().extractFromRawResponse(rawTrack);
		var artistWorkRelationCollection = new ArtistWorkRelationCollection().extractFromRawResponse(rawTrack);
		var releaseGroupCollection = new ReleaseGroupCollection().extractFromRawResponse(rawTrack);
		var workCollection = new WorkCollection().extractFromRawResponse(rawTrack);
		var workWorkRelationCollection = new WorkWorkRelationCollection().extractFromRawResponse(rawTrack);

		return bookshelf.transaction(function(t) {
	
			return Promise.resolve(artist.save(null, { method: 'insert', transacting: t }))
			.then(function() { 
				if(!_.isEmpty(releaseGroupCollection)) return releaseGroupCollection.insertAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(workCollection)) return workCollection.insertAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(workWorkRelationCollection)) return workWorkRelationCollection.insertAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(artistReleaseRelationCollection)) return artistReleaseRelationCollection.insertAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(artistWorkRelationCollection)) return artistWorkRelationCollection.insertAll(null, { transacting: t });
		  })
		})

		.then(_.bind(function() {
			console.log(chalk.green.bold('Track ' + self.getArtistString() + ' has been successfully added to the database.'));
		}, self))

		.catch(function(err) {
			throw('Track ' + self.getArtistString() + ' failed to save to the database due to ' + err);
		});
	},


	shouldSaveArtist: function() {
		return true;
	},


	getArtistString: function() {
		return 'name: ' + (this.artist.name || 'none') + ', id: ' +  (this.artist.musicbrainz_id || 'none');
	}

};

module.exports = ArtistWorker;