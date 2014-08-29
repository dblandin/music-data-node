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
		_.each(response, function(artist) {

			self.add(new self.model({

				name: artist.name,
				echonest_id: artist.id,
				musicbrainz_id: util.getFirstForeignId('musicbrainz', artist.foreign_ids),
				timestamp: new Date()

			}));
		});
		return this;
	},


	// Overriden to check for duplicates before saving
	saveAll: function(parameters, options) {
		return Promise.map(this.models, function(model) {

			if(!model.has('echonest_id'))
				return;

			return bookshelf.knex.select().from(Artist.prototype.tableName).where({ 
				echonest_id: model.get('echonest_id') 
			})
	
			.then(function(rows) {
				if(_.isEmpty(rows))
					return model.save(parameters, options);

				else
					console.log(chalk.blue.bold(model.get('name') + ' is already in the database'));
			});
		});
	}

});

module.exports = ArtistCollection;