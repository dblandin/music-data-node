var bookshelf = require('../../base/bookshelf');
var Artist = require('./Artist');
var util = require('../../base/utilities');
var _ = require('underscore');
var Promise = require('bluebird');
var chalk = require('chalk');

var ArtistCollection = bookshelf.Collection.extend({


	model: Artist,


	extractFromRawResponse: function(response) {
		var self = this;

		if(!_.isArray(response))
			return;

		_.each(response, function(artist) {

			if(!artist || (!artist.name && !artist.mbid))
				return;

			self.add(new self.model({

				name: artist.name,
				musicbrainz_id: artist.mbid,
				updated_at: new Date(),
				created_at: new Date()

			}));
		});
		return this;
	},


	// Overriden to avoid overflowing the DB server with requests
	saveAll: function(parameters, options) {
		
		return Promise.map(this.models, function(model) {
			return model.save(parameters, options);
		}, { concurrency: 10 });
	}

});

module.exports = ArtistCollection;