var logger = require('../base/logManager').getLoggerForFile('./phase4/logs/phase4.log');
var chalk = require('chalk');
var ArtistFetcher = require('./fetchers/ArtistFetcher');
var Promise = require('bluebird');
var bookshelf = require('../base/bookshelf');
var _ = require('underscore');


var ArtistModel = require('./models/Artist');
var SimilarCollection = require('./models/SimilarCollection');

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

		return this.fetchArtistIfNew()

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


	fetchArtistIfNew: function() {
		var artistFetcher = new ArtistFetcher(this.artist);
		var self = this;

		return Promise.resolve(artistFetcher.fetch())

		.then(function(rawArtist) {
			return self.save(rawArtist);
		});
	},

	save: function(rawArtist) {
		var self = this;

		var artist = new ArtistModel().extractFromRawResponse(rawArtist);
		var similarArtists = new SimilarCollection().extractFromRawResponse(rawArtist);

		return bookshelf.transaction(function(t) {
			
			return Promise.resolve(artist.save(null, { transacting: t }))

			.then(function() {
				return similarArtists.saveAll(null, { transacting: t });
			})

		})

		.then(_.bind(function() {
			logger.info(artist.get('name') + ' has been successfully added to the database.');
		}, this))

		.error(function(error) {
			throw('Error during transaction for artist ' + artist.get('name') + ' ' + error);
		})

		.catch(function(exception) {
			throw(artist.get('name') + ' failed to save to the database due to ' + exception);
		});
	}
};

module.exports = ArtistWorker;