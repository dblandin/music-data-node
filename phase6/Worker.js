var logger = require('../base/logManager').getLoggerForFile('./phase6/logs/phase6.log');
var chalk = require('chalk');
var TrackFetcher = require('./fetchers/TrackFetcher');
var Promise = require('bluebird');
var bookshelf = require('../base/bookshelf');
var _ = require('underscore');

var TagCollection = require('./models/TagCollection');
var FanCollection = require('./models/FanCollection');
var SimilarCollection = require('./models/SimilarCollection');

/**
 * Track worker
 */
var TrackWorker = function(track) {
	this.track = track;
};

TrackWorker.prototype = {


	start: function(callback) {
		var self = this;
		this.done = callback;

		try {
			return Promise.resolve(this.fetchTrackIfValid())

			.error(function(error) {
				var errorMessage;
				if(!error)
					errorMessage = 'Unknown error (null error object)';
				else
					errorMessage = _.isString(error) ? error : (error.message || 'Unknown error');

				logger.error(self.getTrackString() + ' - ' + errorMessage);
			})

			.catch(function(exception) {
				var errorMessage;
				if(!exception)
					errorMessage = 'Unknown error (null error object)';
				else
					errorMessage = _.isString(exception) ? exception : (exception.message || 'Unknown error');

				logger.error(self.getTrackString() + ' - ' + errorMessage);
			})

			.finally(function() {
				self.done();
			});
		}
		catch(e) {
			var errorMessage
			if(!e)
				errorMessage = 'Unknown error (null error object)';
			else
				errorMessage = _.isString(e) ? e : (e.message || 'Unknown error');

			logger.error(self.getTrackString() + ' - ' + errorMessage);
			self.done();
		}
	},


	fetchTrackIfValid: function() {
		var self = this;

		if(!this.track.musicbrainz_id && !this.track.name)
			throw('No musicbrainz_id or name for track on phase6');

		if(!this.track.artist_name && !this.track.musicbrainz_id)
			throw('No artist name for track ' + self.getTrackString());

		return Promise.resolve(this.shouldSaveTrack())

		.then(function(shouldFetch) {
		
			// if(!shouldFetch)
			if(false)
				console.log(chalk.blue.bold('Track ' + self.getTrackString() + ' has been already fetched.'));

			else {
				var trackFetcher = new TrackFetcher(self.track);
				
				return Promise.resolve(trackFetcher.fetch())

				.then(function(rawTrack) {
					return self.save(rawTrack);
				});
			}
		});
	},


	save: function(rawTrack) {
		var self = this;

		var tagCollection = new TagCollection().extractFromRawResponse(rawTrack);
		var fanCollection = new FanCollection().extractFromRawResponse(rawTrack);
		var similarCollection = new SimilarCollection().extractFromRawResponse(rawTrack);

		return bookshelf.transaction(function(t) {
	
			return Promise.resolve(tagCollection.saveAll(null, { transacting: t }))

			.then(function() { 
				if(!_.isEmpty(tagCollection)) return fanCollection.saveAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(fanCollection)) return similarCollection.saveAll(null, { transacting: t });
		  })
		})

		.then(_.bind(function() {
			console.log(chalk.green.bold('Track ' + self.getTrackString() + ' has been successfully added to the database.'));
		}, self))

		.catch(function(err) {
			throw('Track ' + self.getTrackString() + ' failed to save to the database due to ' + err);
		});
	},


	shouldSaveTrack: function() {
		var query = {};
		
		if (this.track.musicbrainz_id)  query.musicbrainz_id = this.track.musicbrainz_id;
		if (this.track.name) query.name = this.track.name;
		if (this.track.artist_musicbrainz_id) query.artist_musicbrainz_id = this.track.artist_musicbrainz_id;
		if (this.track.artist_name) query.artist_name = this.track.artist_name;

		console.log(chalk.yellow.bold('"shouldSaveTrack" is returning true always. The check for duplicates is done with hard coded false.'));
		return true;

		// return bookshelf.knex.select().from(TrackModel.prototype.tableName)
		// .where(query).limit(1)
		// .then(function(rows) { return _.isEmpty(rows); });
	},


	getTrackString: function() {
		return 'name: ' + (this.track.name || 'none') + ', id: ' +  (this.track.musicbrainz_id || 'none');
	}

};

module.exports = TrackWorker;