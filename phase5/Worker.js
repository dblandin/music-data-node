var logger = require('../base/logManager').getLoggerForFile('./phase5/logs/phase5.log');
var chalk = require('chalk');
var AlbumFetcher = require('./fetchers/AlbumFetcher');
var Promise = require('bluebird');
var bookshelf = require('../base/bookshelf');
var util = require('../base/utilities');
var _ = require('underscore');

var AlbumModel = require('./models/Album');
var TagCollection = require('./models/TagCollection');
var TrackCollection = require('./models/TrackCollection');

/**
 * Album worker
 */
var AlbumWorker = function(album) {
	this.album = album;
};

AlbumWorker.prototype = {


	start: function(callback) {
		var self = this;
		this.done = callback;

		try {
			return Promise.resolve(this.fetchAlbumIfValid())

			.error(function(error) {
				logger.error(self.getAlbumString() + ' - ' + util.getErrorString(error));
			})

			.catch(function(exception) {
				logger.error(self.getAlbumString() + ' - ' + util.getErrorString(exception));
			})

			.finally(function() {
				self.done();
			});
		}
		catch(exception) {
			logger.error(self.getAlbumString() + ' - ' + util.getErrorString(exception));
			self.done();
		}
	},


	fetchAlbumIfValid: function() {
		var self = this;

		if(!this.album.musicbrainz_id && !this.album.name)
			throw('No musicbrainz_id or name for album on phase4');

		if(!this.album.artist_name && !this.album.musicbrainz_id)
			throw('No artist name for album ' + self.getAlbumString());

		return Promise.resolve(this.shouldSaveAlbum())

		.then(function(shouldFetch) {
		
			if(!shouldFetch)
				console.log(chalk.blue.bold('Album ' + self.getAlbumString() + ' has been already fetched.'));

			else {
				var albumFetcher = new AlbumFetcher(self.album);
				
				return Promise.resolve(albumFetcher.fetch())

				.then(function(rawAlbum) {
					return self.save(rawAlbum);
				});
			}
		});
	},


	save: function(rawAlbum) {
		var self = this;
		var album = new AlbumModel().extractFromRawResponse(rawAlbum);
		var tagCollection = new TagCollection().extractFromRawResponse(rawAlbum);
		var trackCollection = new TrackCollection().extractFromRawResponse(rawAlbum);

		// TODO - check for duplicates before saving to DB.

		return bookshelf.transaction(function(t) {
	
			return Promise.resolve(album.save(null, { transacting: t }))

			.then(function() { 
				if(!_.isEmpty(tagCollection)) return tagCollection.insertAll(null, { transacting: t });
		  })
			.then(function() { 
				if(!_.isEmpty(trackCollection)) return trackCollection.insertAll(null, { transacting: t });
		  })
		})

		.then(_.bind(function() {
			console.log(chalk.green.bold('Album ' + self.getAlbumString() + ' has been successfully added to the database.'));
		}, self))

		.catch(function(err) {
			throw('Album ' + self.getAlbumString() + ' failed to save to the database due to ' + err);
		});
	},


	shouldSaveAlbum: function() {
		var query = {};
		
		if (this.album.musicbrainz_id)  query.musicbrainz_id = this.album.musicbrainz_id;
		if (this.album.name) query.name = this.album.name;
		if (this.album.artist_musicbrainz_id) query.artist_musicbrainz_id = this.album.artist_musicbrainz_id;
		if (this.album.artist_name) query.artist_name = this.album.artist_name;

		return bookshelf.knex.select().from(AlbumModel.prototype.tableName)
		.where(query).limit(1)
		.then(function(rows) { return _.isEmpty(rows); });
	},


	getAlbumString: function() {
		return 'name: ' + (this.album.name || 'none') + ', id: ' +  (this.album.musicbrainz_id || 'none');
	}

};

module.exports = AlbumWorker;