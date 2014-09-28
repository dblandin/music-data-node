var logger = require('../base/logManager').getLoggerForFile('./phase4/logs/phase4.log');
var chalk = require('chalk');
var ArtistFetcher = require('./fetchers/ArtistFetcher');
var Promise = require('bluebird');
var bookshelf = require('../base/bookshelf');
var _ = require('underscore');

var ArtistModel = require('./models/Artist');
var AlbumCollection = require('./models/AlbumCollection');
var FanCollection = require('./models/FanCollection');
var SimilarCollection = require('./models/SimilarCollection');
var TagCollection = require('./models/TagCollection');
var TrackCollection = require('./models/TrackCollection');

/**
 * Artist worker
 */
var ArtistWorker = function(artist) {
	this.artist = artist;
};

ArtistWorker.prototype = {


	start: function(callback) {
		var self = this;
		this.done = callback;

		try {
			return Promise.resolve(this.fetchArtistIfValid())

			.error(function(error) {
				logger.error(self.getArtistString() + ' - ' + error);
			})

			.catch(function(exception) {
				logger.error(self.getArtistString() + ' - ' + exception);
			})

			.finally(function() {
				self.done();
			});
		}
		catch(e) {
			logger.error(self.getArtistString() + ' - ' + e);
			self.done();
		}
	},


	fetchArtistIfValid: function() {
		var self = this;

		if(!this.artist.musicbrainz_id && !this.artist.name)
			throw('No musicbrainz_id or name for artist on phase4');

		return Promise.resolve(this.shouldSaveArtist())

		.then(function(shouldFetch) {
		
			if(!shouldFetch)
				console.log(chalk.blue.bold(self.getArtistString() + ' has been already fetched.'));

			else {
				var artistFetcher = new ArtistFetcher(self.artist);
				
				return Promise.resolve(artistFetcher.fetch())

				.then(function(rawArtist) {
					return self.save(rawArtist);
				});
			}
		});
	},


	save: function(rawArtist) {
		var self = this;
		var artist = new ArtistModel().extractFromRawResponse(rawArtist);
		var albumCollection = new AlbumCollection().extractFromRawResponse(rawArtist);
		var fanCollection = new FanCollection().extractFromRawResponse(rawArtist);
		var similarCollection = new SimilarCollection().extractFromRawResponse(rawArtist);
		var tagCollection = new TagCollection().extractFromRawResponse(rawArtist);
		var trackCollection = new TrackCollection().extractFromRawResponse(rawArtist);

		return bookshelf.transaction(function(t) {
	
			return Promise.resolve(artist.save(null, { transacting: t }))

			.then(function() { 
				if(!_.isEmpty(albumCollection)) return albumCollection.saveAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(fanCollection)) return fanCollection.saveAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(similarCollection)) return similarCollection.saveAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(tagCollection)) return tagCollection.saveAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(trackCollection)) return trackCollection.saveAll(null, { transacting: t });
		  })
		})

		.then(_.bind(function() {
			console.log(chalk.green.bold(self.getArtistString() + ' has been successfully added to the database.'));
		}, self))

		.catch(function(err) {
			throw(self.getArtistString() + ' failed to save to the database due to ' + err);
		});
	},


	shouldSaveArtist: function() {
		var query = this.artist.musicbrainz_id ? { musicbrainz_id: this.artist.musicbrainz_id } : { name: this.artist.name }

		return bookshelf.knex.select().from(ArtistModel.prototype.tableName)
		.where(query).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	},


	getArtistString: function() {
		return 'Artist name: ' + (this.artist.name || 'none') + ', mbid: ' +  (this.artist.musicbrainz_id || 'none');
	}

};

module.exports = ArtistWorker;