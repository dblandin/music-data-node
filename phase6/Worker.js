var logger = require('../base/logManager').getLoggerForFile('./phase6/logs/phase6.log');
var chalk = require('chalk');
var TrackFetcher = require('./fetchers/TrackFetcher');
var Promise = require('bluebird');
var bookshelf = require('../base/bookshelf');
var util = require('../base/utilities');
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
				logger.error(self.getTrackString() + ' - ' + util.getErrorString(error));
			})

			.catch(function(exception) {
				logger.error(self.getTrackString() + ' - ' + util.getErrorString(exception));
			})

			.finally(function() {
				self.done();
			});
		}
		catch(e) {
			logger.error(self.getTrackString() + ' - ' + util.getErrorString(e));
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
		
			if(!shouldFetch)
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
		// var similarCollection = new SimilarCollection().extractFromRawResponse(rawTrack);

		return bookshelf.transaction(function(t) {
	
			return Promise.resolve(tagCollection.insertAll(null, { transacting: t }))

			.then(function() { 
				if(!_.isEmpty(fanCollection)) return fanCollection.insertAll(null, { transacting: t });
		  })
			// .then(function() { 
			// 	if(!_.isEmpty(similarCollection)) return similarCollection.insertAll(null, { transacting: t });
		 //  })
		})

		.then(_.bind(function() {
			console.log(chalk.green.bold('Track ' + self.getTrackString() + ' has been successfully added to the database.'));
		}, self))

		.catch(function(err) {
			throw('Track ' + self.getTrackString() + ' failed to save to the database due to ' + err);
		});
	},


	shouldSaveTrack: function() {
		// Since we have no main table, we will use the top_fans one to 
		// determine is a track has already been fetched or not.
		var query = {};
		
		query.track_musicbrainz_id = this.track.musicbrainz_id ? this.track.musicbrainz_id : null;
		query.track_name = this.track.name ? this.track.name : null;

		return bookshelf.knex.select().from(FanCollection.prototype.model.prototype.tableName)
		.where(query).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	},


	getTrackString: function() {
		return 'name: ' + (this.track.name || 'none') + ', id: ' +  (this.track.musicbrainz_id || 'none');
	}

};

module.exports = TrackWorker;