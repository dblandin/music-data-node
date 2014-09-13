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

		return this.fetchArtistIfValid()

		.error(function(error) {
			logger.error(error);
		})

		.catch(function(exception) {
			logger.error(exception);
		})

		.finally(function() {
			self.done();
		});
	},


	fetchArtistIfValid: function() {
		var self = this;

		if(!this.artist.musicbrainz_id)
			throw('No name or musicbrainz_id for artist on phase4');

		return Promise.resolve(this.getOmitArray())

		.then(function(omitArray) {
			self.omitArray = omitArray;

			if(self.omitArray.length === 6)
				console.log(chalk.blue.bold('Artist ' + (self.artist.name || self.artist.musicbrainz_id) + ' has been already fetched.'));

			else {
				var artistFetcher = new ArtistFetcher(self.artist);

				return Promise.resolve(artistFetcher.fetch({ omit: omitArray }))

				.then(function(rawArtist) {
					return self.save(rawArtist);
				});
			}
		});
	},


	getOmitArray: function() {
		var omittedFields = [];
		var arr = [
			{ key: 'artist', 	resolver: _.bind(this.shouldSaveArtist, this) },  
			{ key: 'similar', resolver: _.bind(this.shouldSaveSimilar, this) },  
			{ key: 'albums', 	resolver: _.bind(this.shouldSaveAlbums, this) },  
			{ key: 'tags', 		resolver: _.bind(this.shouldSaveTags, this) },  
			{ key: 'fans', 		resolver: _.bind(this.shouldSaveFans, this) },  
			{ key: 'tracks', 	resolver: _.bind(this.shouldSaveTracks, this) }  
		];

		return Promise.map(arr, function(obj) {
			return Promise.resolve(obj.resolver()).then(function(shouldSave) {

				if(!shouldSave) omittedFields.push(obj.key);

			});
		})

		.then(function() {
			console.log(omittedFields);
			return omittedFields;
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

		return bookshelf.transaction(function(t) {
	
			return Promise.resolve((function() {
				if(_.indexOf(self.omitArray, 'artist') !== -1) return;

			var artist = new ArtistModel().extractFromRawResponse(rawArtist);
			return artist.save(null, { transacting: t });
			})())

			.then(function() {
				if(_.indexOf(self.omitArray, 'albums') !== -1) return;

				var albumCollection = new AlbumCollection().extractFromRawResponse(rawArtist);
				return albumCollection.saveAll(null, { transacting: t });
			})

			.then(function() {
				if(_.indexOf(self.omitArray, 'fans') !== -1) return;

				var fanCollection = new FanCollection().extractFromRawResponse(rawArtist);
				return fanCollection.saveAll(null, { transacting: t });
			})

			.then(function() {
				if(_.indexOf(self.omitArray, 'similar') !== -1) return;

				var similarCollection = new SimilarCollection().extractFromRawResponse(rawArtist);
				return similarCollection.saveAll(null, { transacting: t });
			})

			.then(function() {
				if(_.indexOf(self.omitArray, 'tags') !== -1) return;

				var tagCollection = new TagCollection().extractFromRawResponse(rawArtist);
				return tagCollection.saveAll(null, { transacting: t });
			})

			.then(function() {
				if(_.indexOf(self.omitArray, 'tracks') !== -1) return;

				var trackCollection = new TrackCollection().extractFromRawResponse(rawArtist);
				return trackCollection.saveAll(null, { transacting: t });
			})
		})

		.then(_.bind(function() {
			logger.info(self.artist.name || self.artist.musicbrainz_id + ' has been successfully added to the database.');
		}, self))

		.error(function(error) {
			throw('Error during transaction for artist ' + self.artist.name || self.artist.musicbrainz_id + ' ' + error);
		})

		.catch(function(exception) {
			throw(self.artist.name || self.artist.musicbrainz_id + ' failed to save to the database due to ' + exception);
		});
	},


	shouldSaveArtist: function() {
		return bookshelf.knex.select().from(ArtistModel.prototype.tableName)
		.where({ musicbrainz_id: this.artist.musicbrainz_id }).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	},


	shouldSaveSimilar: function() {
		return bookshelf.knex.select().from(SimilarCollection.prototype.model.prototype.tableName)			
		.where({ artist_musicbrainz_id: this.artist.musicbrainz_id }).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	},


	shouldSaveAlbums: function() {
		return bookshelf.knex.select().from(AlbumCollection.prototype.model.prototype.tableName)			
		.where({ artist_musicbrainz_id: this.artist.musicbrainz_id }).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	},


	shouldSaveTags: function() {
		return bookshelf.knex.select().from(TagCollection.prototype.model.prototype.tableName)			
		.where({ artist_musicbrainz_id: this.artist.musicbrainz_id }).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	},


	shouldSaveFans: function() {
		return bookshelf.knex.select().from(FanCollection.prototype.model.prototype.tableName)			
		.where({ artist_musicbrainz_id: this.artist.musicbrainz_id }).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	},


	shouldSaveTracks: function() {
		return bookshelf.knex.select().from(TrackCollection.prototype.model.prototype.tableName)			
		.where({ artist_musicbrainz_id: this.artist.musicbrainz_id }).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	}

};

module.exports = ArtistWorker;