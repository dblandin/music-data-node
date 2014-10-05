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


	// Overriden to check for duplicates before saving
	saveAll: function(parameters, options) {
		
		return Promise.map(this.models, function(model) {

			var storedProcedure = 'phase0_insert_if_missing'; // assigns now() to update and create
			var _name = (model.get('name')) || '';
			var _musicbrainz_id = (model.get('musicbrainz_id')) || '';

			var query = 'SELECT "' + storedProcedure + '"($$' + _name + '$$, $$' + _musicbrainz_id + '$$);';

			return bookshelf.knex.raw(query)

			.catch(function(err) {
			  throw(err);
			});
		}, { concurrency: 3 });
	}

});

module.exports = ArtistCollection;