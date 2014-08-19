var events = require('events');
var util = require('util');
var _ = require('underscore');
var bookshelf = require('../base/bookshelf');
var Promise = require('bluebird');
var chalk = require('chalk');
var logger = require('../base/logManager').getLoggerForFile('./phase3/logs/phase3.log');


var SongFetcher = require('./fetchers/SongFetcher');
var SongModel = require('./models/Song');
var SongCollection = require('./models/SongCollection');
var SongTypeCollection = require('./models/SongTypeCollection');

/**
 * Song worker
 */
var SongWorker = function(artist, page, force) {
	this.artist = artist;
};


SongWorker.prototype = {


	start: function(callback) {
		var self = this;
		var fetchSongsForArtist = _.bind(this.fetchSongsForArtist, this);
		var tableName = SongModel.prototype.tableName;

		this.done = callback;

		return bookshelf.knex.select().from(tableName)
			.where({ echonest_artist_id: this.artist.echonest_id || null })

			.then(function(rows) {
				return fetchSongsForArtist(rows);
			})

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


	fetchSongsForArtist: function(songsByArtist) {
		var songFetcher = new SongFetcher(this.artist);
		var save = _.bind(this.save, this);
		var self = this;

		if (songsByArtist.length > 0) {
			console.log(chalk.blue.bold('Songs for ' + this.artist.name + ' are already in the database'));
			return;
		}

		console.log('Fetching songs for ' + this.artist.name);

		return Promise.resolve(songFetcher.fetch())

		.then(function(rawSongs) {
			return save(rawSongs);
		});
	},


	save: function(rawSongs) {
		var self = this;
		
		var songs = new SongCollection();
		var songTypes = new SongTypeCollection();

		songs.extractFromRawReponse(rawSongs);
		songTypes.extractFromRawReponse(rawSongs);
		
		return bookshelf.transaction(function(t) {

			return Promise.resolve(songs.saveAll(null, { transacting: t}))

			.then(function() {
				return songTypes.saveAll(null, { transacting: t });
			})
		})

		.then(function() {
			logger.info(self.artist.name + '\'s songs have been successfully added to the database.');
		})

		.error(function(error) {
			throw('Error during transaction for songs. ' + error);
		})

		.catch(function(exception) {
			throw('Songs failed to save to the database due to ' + exception);
		});
	}
};

module.exports = SongWorker;