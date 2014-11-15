var logger = require('../base/logManager').getLoggerForFile('./phase7/logs/phase7.log');
var chalk = require('chalk');
var ArtistFetcher = require('./fetchers/ArtistFetcher');
var Promise = require('bluebird');
var bookshelf = require('../base/bookshelf');
var util = require('../base/utilities');
var _ = require('underscore');

// var TagCollection = require('./models/TagCollection');
// var FanCollection = require('./models/FanCollection');
// var SimilarCollection = require('./models/SimilarCollection');

/**
 * Track worker
 */
var ArtistWorker = function(artist) {
	this.artist = artist;
};

ArtistWorker.prototype = {


	start: function(callback) {
		var self  = this;
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
			})
			
		}
		catch(e) {
			logger.error(self.getArtistString() + ' - ' + util.getErrorString(e));
			this.done();
		}
	},


	fetchArtistIfValid: function() {
		var self = this;

		if(!this.artist.musicbrainz_id && !this.artist.name)
			throw('No musicbrainz_id or name for artist on phase 7');

		if(!this.artist.artist_name && !this.artist.musicbrainz_id)
			throw('No artist name for artist ' + self.getArtistString());

		return Promise.resolve(this.shouldSaveArtist())

		.then(function(shouldFetch) {
		
			if(!shouldFetch)
				console.log(chalk.blue.bold('Artist ' + self.getArtistString() + ' has been already fetched.'));

			else {
				var artistFetcher = new ArtistFetcher(self.artist);
				
				return Promise.resolve(artistFetcher.fetch())

				.then(function(rawArtist) {
					return self.save(rawArtist);
				});
			}
		});
	},


	// fetch: function() {
	// 	var rawArtist = {};
	// 	var query = { arid: this.artist.musicbrainz_id };

	// 	return Promise.resolve(nodebrainz.artist(this.artist.musicbrainz_id))

	// 	.then(function(artist) {
	// 		rawArtist = artist;
	// 		nodebrainz.search('release-group', {arid: porcupineTreeMbid, type:'album'})
	// 	})

	// 	.then(function() {

	// 	})

	// 	.then(function() {

	// 	})

	// 	.then(function() {

	// 	});	

	// 	// Artist lookup
	// 	nodebrainz.artist(porcupineTreeMbid, {}, function(error, artist) {
	// 		console.log(artist);
	// 	});

	// 	// release group
	// 	nodebrainz.search('release-group', {arid: porcupineTreeMbid, type:'album|ep'}, function(error, response) {
	// 		console.log(response);
	// 	});

	// 	// release
	// 	nodebrainz.search('release', {arid: porcupineTreeMbid}, function(error, response) {
	// 		console.log(response);
	// 	});

	// 	// recordings
	// 	nodebrainz.search('recording', {arid: porcupineTreeMbid}, function(error, response) {
	// 		console.log(response);
	// 	});

	// 	// works
	// 	nodebrainz.search('work', {arid: porcupineTreeMbid}, function(error, response) {
	// 		console.log(response);
	// 	});

	// },


	save: function(rawArtist) {
		var self = this;

		// var tagCollection = new TagCollection().extractFromRawResponse(rawArtist);
		// var fanCollection = new FanCollection().extractFromRawResponse(rawArtist);
		// var similarCollection = new SimilarCollection().extractFromRawResponse(rawArtist);

		// return bookshelf.transaction(function(t) {
	
		// 	return Promise.resolve(tagCollection.insertAll(null, { transacting: t }))

		// 	.then(function() { 
		// 		if(!_.isEmpty(fanCollection)) return fanCollection.insertAll(null, { transacting: t });
		//   })
			// .then(function() { 
			// 	if(!_.isEmpty(similarCollection)) return similarCollection.insertAll(null, { transacting: t });
		 //  })
		// })

		// .then(_.bind(function() {
		// 	console.log(chalk.green.bold('Track ' + self.getArtistString() + ' has been successfully added to the database.'));
		// }, self))

		// .catch(function(err) {
		// 	throw('Track ' + self.getArtistString() + ' failed to save to the database due to ' + err);
		// });
	},


	shouldSaveArtist: function() {

		return true;
		
		var query = {};
		
		query.track_musicbrainz_id = this.artist.musicbrainz_id ? this.artist.musicbrainz_id : null;
		query.track_name = this.artist.name ? this.artist.name : null;

		return bookshelf.knex.select().from(FanCollection.prototype.model.prototype.tableName)
		.where(query).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	},


	getArtistString: function() {
		return 'name: ' + (this.artist.name || 'none') + ', id: ' +  (this.artist.musicbrainz_id || 'none');
	}

};

module.exports = ArtistWorker;