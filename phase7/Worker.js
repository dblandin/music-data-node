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
var BandMemberRelationCollection = require('./models/BandMemberRelationCollection'); 
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
			return Promise.resolve(this.fetchArtistIfValid(self.artist))

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


	fetchArtistIfValid: function(artist) {
		var self = this;

		if(!artist.musicbrainz_id && !artist.name)
			throw('No musicbrainz_id or name for artist on phase 7');

		return Promise.resolve(this.shouldSaveArtist())

		.bind({ artist: artist })

		.then(function(shouldFetch) {
		
			if(!shouldFetch)
				console.log(chalk.blue.bold('Artist ' + self.getArtistString() + ' has been already fetched.'));

			else {
				var artistFetcher = new ArtistFetcher(this.artist);
				
				return Promise.resolve(artistFetcher.fetch()).bind(this)

				.then(function(rawArtist) {
					return self.save(rawArtist)

					.then(function() {
						var groupMembers = self.extractGroupMembers(rawArtist);
						
						if(groupMembers && !_.isEmpty(groupMembers)) {
							return Promise.map(groupMembers, function(item, index, arrayLength) {
								
								return self.fetchArtistIfValid(item)

								.catch(function(exception) {
									logger.error(self.getArtistString(item) + ' (group member) - ' + util.getErrorString(exception));
								});

							}, { concurrency: 1 });
						}
					});
				});
			}
		});
	},


	extractGroupMembers: function(artist) {
		if(!artist 
			|| !_.isString(artist.type) 
			|| artist.type.toLowerCase() !== 'group' 
			|| !artist.relations 
			|| _.isEmpty(artist.relations)) return null;

		var groupMembers = _.pluck(_.where(artist.relations, { type: 'member of band' }), 'artist');
		var normalizedGroupMembers = [];

		for(var i = 0; i < groupMembers.length; i++) {
			if(!_.findWhere(normalizedGroupMembers, { musicbrainz_id: groupMembers[i].id }))
				normalizedGroupMembers.push({ musicbrainz_id: groupMembers[i].id, name: groupMembers[i].name });
		}
		
		return normalizedGroupMembers;
	},


	save: function(rawArtist) {
		var self = this;

		var artist = new Artist().extractFromRawResponse(rawArtist);
		var artistReleaseRelationCollection = new ArtistReleaseRelationCollection().extractFromRawResponse(rawArtist);
		var artistWorkRelationCollection = new ArtistWorkRelationCollection().extractFromRawResponse(rawArtist);
		var releaseGroupCollection = new ReleaseGroupCollection().extractFromRawResponse(rawArtist);
		var workCollection = new WorkCollection().extractFromRawResponse(rawArtist);
		var workWorkRelationCollection = new WorkWorkRelationCollection().extractFromRawResponse(rawArtist);
		var bandMemberRelationCollection = new BandMemberRelationCollection().extractFromRawResponse(rawArtist);

		// Artists duplicates will break. Other duplicates will remain.
		return bookshelf.transaction(function(t) {
			return Promise.resolve(artist.save(null, { method: 'insert', transacting: t }))
			
			.then(function() { 
				if(!_.isEmpty(releaseGroupCollection)) 
					return Promise.resolve(releaseGroupCollection.insertAll(null, { transacting: t }));
		  })
			.then(function() { 
				if(!_.isEmpty(workCollection)) 
					return Promise.resolve(workCollection.insertAll(null, { transacting: t }));
		  })
			.then(function() { 
				if(!_.isEmpty(workWorkRelationCollection)) 
					return Promise.resolve(workWorkRelationCollection.insertAll(null, { transacting: t }));
		  })
			.then(function() { 
				if(!_.isEmpty(artistReleaseRelationCollection)) 
					return Promise.resolve(artistReleaseRelationCollection.insertAll(null, { transacting: t }));
		  })
			.then(function() { 
				if(!_.isEmpty(artistWorkRelationCollection)) 
					return Promise.resolve(artistWorkRelationCollection.insertAll(null, { transacting: t }));
		  })
		  .then(function() { 
				if(!_.isEmpty(bandMemberRelationCollection)) 
					return Promise.resolve(bandMemberRelationCollection.insertAll(null, { transacting: t }));
		  })
		})

		.then(_.bind(function() {
			console.log(chalk.green.bold('Artist ' + self.getArtistString(rawArtist) + ' has been successfully added to the database.'));
		}, self))

		.catch(function(err) {
			throw('Artist ' + self.getArtistString(rawArtist) + ' failed to save to the database due to ' + err);
		});
	},


	shouldSaveArtist: function() {
		return true;
	},


	getArtistString: function(artist) {
		artist = artist || this.artist;
		return 'name: ' + (artist.name || 'none') + ', id: ' +  (artist.musicbrainz_id || artist.id || 'none');
	}

};

module.exports = ArtistWorker;