var util = require('util');
var _ = require('underscore');
var bookshelf = require('../base/bookshelf');
var Promise = require('bluebird');
var chalk = require('chalk');
var logger = require('../base/logManager').getLoggerForFile('./phase1/logs/phase1.log');

var ArtistScraper = require('./fetchers/ArtistScraper');
var ArtistModel = require('./models/Artist');
var ArtistCollection = require('./models/ArtistCollection');


/**
 * Artist worker
 */
var ArtistWorker = function(query) {
	this.query = query;
};


ArtistWorker.prototype = {


	start: function(callback) {
		var self = this;
		var getAllArtists = _.bind(this.getAllArtists, this);

		this.done = callback;
		
		try {
			return getAllArtists()

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


	getAllArtists: function() {
		var self = this;
		var artistScraper = new ArtistScraper(this.query);

		return Promise.resolve(artistScraper.fetch())

		.then(function(rawArtists) {
			return self.save(rawArtists);
		});
	},


	save: function(rawArtist) {
		var self = this;
		var artists = new ArtistCollection().extractFromRawResponse(rawArtist);

		return bookshelf.transaction(function(t) {
			return Promise.resolve(artists.insertAll(null, { transacting: t }));
		})

		.then(_.bind(function() {
			logger.info('Query: ' + self.query + ' has been successfully added to the database.');
		}, this))

		.error(function(error) {
			throw('Error during transaction for query ' + self.query + ' ' + error);
		})

		.catch(function(exception) {
			throw('Query: ' + self.query + ' failed to save to the database due to ' + exception);
		});
	}

};

module.exports = ArtistWorker;