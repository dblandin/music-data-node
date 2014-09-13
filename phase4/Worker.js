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
				logger.error(error);
			})

			.catch(function(exception) {
				logger.error(exception);
			})

			.finally(function() {
				self.done();
			});
		}
		catch(e) {
			logger.error(e);
			self.done();
		}
	},


	fetchArtistIfValid: function() {
		var self = this;

		if(!this.artist.musicbrainz_id)
			throw('No musicbrainz_id for artist on phase4');

		return Promise.resolve(this.shouldSaveArtist())

		.then(function(shouldFetch) {
		
			if(!shouldFetch)
				console.log(chalk.blue.bold('Artist ' + (self.artist.name || self.artist.musicbrainz_id) + ' has been already fetched.'));

			else {
				var artistFetcher = new ArtistFetcher(self.artist);
				
				return Promise.resolve(artistFetcher.fetch())

				.then(function(rawArtist) {
					return self.save(rawArtist);
				});
			}
		});
	},


	existsInDatabase: function(musicbrainz_id) {
		if(!musicbrainz_id)
			return false;

		return bookshelf.knex.select().from(ArtistModel.prototype.tableName)
			
			.where({ musicbrainz_id: musicbrainz_id })

			.then(function(rows) {
				return rows.length > 0;
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

			.then(function() { return albumCollection.saveAll(null, { transacting: t }); })
			.then(function() { return fanCollection.saveAll(null, { transacting: t }); })
			.then(function() { return similarCollection.saveAll(null, { transacting: t }); })
			.then(function() { return tagCollection.saveAll(null, { transacting: t }); })
			.then(function() { return trackCollection.saveAll(null, { transacting: t }); })
		})

		.then(_.bind(function() {
			logger.info((self.artist.name || self.artist.musicbrainz_id) + ' has been successfully added to the database.');
		}, self))

		.error(function(error) {
			throw('Error during transaction for artist ' + self.artist.name || self.artist.musicbrainz_id + ' ' + error);
		})

		.catch(function(exception) {
			throw((self.artist.name || self.artist.musicbrainz_id) + ' failed to save to the database due to ' + exception);
		});
	},

	shouldSaveArtist: function() {
		return bookshelf.knex.select().from(ArtistModel.prototype.tableName)
		.where({ musicbrainz_id: this.artist.musicbrainz_id }).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	}

};

module.exports = ArtistWorker;