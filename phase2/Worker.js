var util = require('util');
var _ = require('underscore');
var bookshelf = require('../base/bookshelf');
var Promise = require('bluebird');
var chalk = require('chalk');
var logger = require('../base/logManager').getLoggerForFile('./phase2/logs/phase2.log');

var ArtistFetcher = require('./fetchers/ArtistFetcher');
var ArtistModel = require('./models/Artist');
var TermCollection = require('./models/TermCollection');
var GenreCollection = require('./models/GenreCollection');
var BiographyCollection = require('./models/BiographyCollection');
var ReviewCollection = require('./models/ReviewCollection');
var SimilarCollection = require('./models/SimilarCollection');
var SimilarBefore1970Collection = require('./models/SimilarBefore1970Collection');
var SimilarAfter1969Collection = require('./models/SimilarAfter1969Collection');


/**
 * Artist worker
 */
var ArtistWorker = function(artist) {
	this.artist = artist;
};


ArtistWorker.prototype = {


	start: function(callback) {
		var self = this;
		var fetchArtistIfNew = _.bind(this.fetchArtistIfNew, this);
		var tableName = ArtistModel.prototype.tableName;

		this.done = callback;
		try {
			return bookshelf.knex.select().from(tableName)
				.where({ name: this.artist.name || null })
				.orWhere({ echonest_id: this.artist.echonest_id || null })

				.then(function(rows) {
					return fetchArtistIfNew(rows);
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
		}
		catch(e) {
			logger.error(e);
			self.done();
		}
	},


	fetchArtistIfNew: function(duplicates) {
		var artistFetcher = new ArtistFetcher(this.artist);
		var self = this;

		if (duplicates.length > 0) {
			console.log(chalk.blue.bold(this.artist.name + ' is already in the database'));
			return;
		}

		console.log('Fetching ' + this.artist.name);

		return Promise.resolve(artistFetcher.fetch())

		.then(function(rawArtist) {
			return self.save(rawArtist);
		});
	},


	save: function(rawArtist) {
		var self =						this;
		var artist = 					new ArtistModel().extractFromRawResponse(rawArtist);
		var terms = 					new TermCollection().extractFromRawResponse(rawArtist);
		var genres = 					new GenreCollection().extractFromRawResponse(rawArtist);
		var biographies = 		new BiographyCollection().extractFromRawResponse(rawArtist);
		var reviews = 				new ReviewCollection().extractFromRawResponse(rawArtist);
		var similarities = 		new SimilarCollection().extractFromRawResponse(rawArtist);
		var oldSimilarities = new SimilarBefore1970Collection().extractFromRawResponse(rawArtist);
		var newSimilarities = new SimilarAfter1969Collection().extractFromRawResponse(rawArtist);

		return bookshelf.transaction(function(t) {

			return Promise.resolve(artist.save(null, { transacting: t }))

			.then(function() {
				return terms.saveAll(null, { transacting: t });
			})
			.then(function() {
				return genres.saveAll(null, { transacting: t });
			})
			.then(function() {
				return biographies.saveAll(null, { transacting: t });
			})
			.then(function() {
				return reviews.saveAll(null, { transacting: t });
			})
			.then(function() {
				return similarities.saveAll(null, { transacting: t });
			})
			.then(function() {
				return oldSimilarities.saveAll(null, { transacting: t });
			})
			.then(function() {
				return newSimilarities.saveAll(null, { transacting: t });
			})
		})

		.then(_.bind(function() {
			chalk.green.bold(artist.get('name') + ' has been successfully added to the database.');
		}, this))

		.error(function(error) {
			throw('Error during transaction for artist ' + artist.get('name') + ' ' + error);
		})

		.catch(function(exception) {
			throw(artist.get('name') + ' failed to save to the database due to ' + exception);
		});
	},

	hasDuplicatesInDatabase: function(artist) {
		return bookshelf.knex.select().from(ArtistModel.prototype.tableName)
			.where({ echonest_id: artist.get('echonest_id') })
			.then(function(duplicates) {
				return (duplicates.length > 0);
			});
	}

};

module.exports = ArtistWorker;