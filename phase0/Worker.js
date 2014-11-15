var util = require('util');
var _ = require('underscore');
var bookshelf = require('../base/bookshelf');
var Promise = require('bluebird');
var chalk = require('chalk');
var logger = require('../base/logManager').getLoggerForFile('./phase0/logs/phase0.log');

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
		var fetchArtistsIfValid = _.bind(this.fetchArtistsIfValid, this);

		this.done = callback;
		
		try {
			return Promise.resolve(fetchArtistsIfValid())

			.error(function(error) {
				logger.error(self.getInputString() + ' - ' + self.getErrorString(error));
			})

			.catch(function(exception) {
				logger.error(self.getInputString() + ' - ' + self.getErrorString(exception));
			})

			.finally(function() {
				self.done();
			});
		}
		catch(e) {
			logger.error(self.getIn() + ' - ' + self.getErrorString(e));
			self.done();		}
	},


	fetchArtistsIfValid: function() {
		var self = this;
		var artistScraper = new ArtistScraper(this.query);

		if(_.isUndefined(this.query) || _.isNull(this.query) || _.isNaN(this.query) || !_.isString(this.query))
			throw('Query null, undefined or not valid: ' + query);

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
			logger.info(self.getInputString() + ' has been successfully added to the database.');
		}, this))

		.catch(function(exception) {
			throw(self.getInputString() + ' failed to save to the database due to ' + exception);
		});
	},

	getInputString: function() {
		return ('Query string ' + (this.query || 'unknown'));
	},

	getErrorString: function(error) {
		if(!error)
			return 'Unknown error (null error object)';
		else
			return (_.isString(error) ? error : (error.message || 'Unknown error'));
	}

};

module.exports = ArtistWorker;