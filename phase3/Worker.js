var events = require('events');
var util = require('../base/utilities');
var _ = require('underscore');
var bookshelf = require('../base/bookshelf');
var Promise = require('bluebird');
var chalk = require('chalk');
var logger = require('../base/logManager').getLoggerForFile('./phase3/logs/phase3.log');


var SongFetcher = require('./fetchers/SongFetcher');
var SongModel = require('./models/Song');
var SongCollection = require('./models/SongCollection');
/**
 * Song worker
 */
var SongWorker = function(artist, page, force) {
	this.artist = artist;
};


SongWorker.prototype = {


	start: function(callback) {
		var self = this;
		var fetchSongsIfValid = _.bind(this.fetchSongsIfValid, this);
		var tableName = SongModel.prototype.tableName;

		this.done = callback;

		try {

			return Promise.resolve(this.fetchSongsIfValid())

			.error(function(error) {
				logger.error(self.getArtistString() + ' - ' + util.getErrorString(error));
			})

			.catch(function(exception) {
				logger.error(self.getArtistString() + ' - ' + util.getErrorString(exception));
			})

			.finally(function() {
				self.done();
			});

		}
		catch(e) {
			logger.error(self.getArtistString() + ' - ' + util.getErrorString(e));
			self.done();
		}
	},


	fetchSongsIfValid: function() {
		var save = _.bind(this.save, this);
		var self = this;

		if(!this.artist || (!this.artist.name && !this.artist.echonest_id))
			throw('No artist name or echonest_id for artist on phase 3');

		return Promise.resolve(this.shouldSaveSongs())

		.then(function(shouldFetch) {
			if(!shouldFetch)
				console.log(chalk.blue.bold(self.getArtistString() + ' has been already fetched.'));

			else {
				var songFetcher = new SongFetcher(self.artist);
				
				return Promise.resolve(songFetcher.fetch())
				
				.then(function(rawSongs) {
					return save(rawSongs);
				});
			}
		})		
	},


	save: function(rawSongs) {
		var self = this;
		
		var songs = new SongCollection();

		songs.extractFromRawResponse(rawSongs);
		
		return bookshelf.transaction(function(t) {

			return Promise.resolve(songs.insertAll(null, { transacting: t}));

		})

		.then(function() {
			console.log(chalk.green.bold(self.getArtistString() + '\'s songs have been successfully added to the database.'));
		})

		.error(function(error) {
			throw('Error during DB transaction for songs of artist ' + self.getArtistString() + ' ' + error);
		})

		.catch(function(exception) {
			throw(self.getArtistString() + ' failed to save to the DB due to ' + exception);
		});
	},


	shouldSaveSongs: function() {
		return true;
	},


	getArtistString: function() {
		return 'Artist name: ' + (this.artist.name || 'none') + ', mbid: ' +  (this.artist.echonest_id || 'none');
	}	
};

module.exports = SongWorker;