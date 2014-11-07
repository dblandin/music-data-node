var util = require('util');
var _ = require('underscore');
var bookshelf = require('../base/bookshelf');
var util = require('../base/utilities');
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
			});
		}
		catch(e) {
			logger.error(self.getArtistString() + ' - ' + util.getErrorString(e));
			self.done();
		}
	},


	fetchArtistIfValid: function() {
		var self = this;

		if(!this.artist || (!this.artist.name && !this.artist.echonest_id))
			throw('No artist name or echonest_id for artist on phase 2');

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
		var self =						this;
		var artist = 					new ArtistModel().extractFromRawResponse(rawArtist);
		var terms = 					new TermCollection().extractFromRawResponse(rawArtist);
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
			console.log(chalk.green.bold(self.getArtistString() + ' has been successfully added to the database.'));
		}, self))

		.error(function(error) {
			throw('Error during transaction for artist ' + self.getArtistString() + ' ' + error);
		})

		.catch(function(exception) {
			throw(self.getArtistString() + ' failed to save to the database due to ' + exception);
		});
	},


	shouldSaveArtist: function() {
		var query = this.artist.echonest_id ? { echonest_id: this.artist.echonest_id } : { name: this.artist.name }

		return bookshelf.knex.select().from(ArtistModel.prototype.tableName)
		.where(query).limit(1)
		.then(function(rows) { 
			return _.isEmpty(rows);
		});
	},


	getArtistString: function() {
		return 'Artist name: ' + (this.artist.name || 'none') + ', mbid: ' +  (this.artist.echonest_id || 'none');
	}

};

module.exports = ArtistWorker;