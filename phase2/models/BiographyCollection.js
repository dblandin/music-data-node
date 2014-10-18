var bookshelf = require('../../base/bookshelf');
var Biography = require('./Biography');
var _ = require('underscore');

var BiographyCollection = bookshelf.Collection.extend({


	model: Biography,


	limitPerArtist: 5,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if(!_.isArray(response.biographies))
			return;

		_.each(_.first(response.biographies, this.limitPerArtist), function(biography) {

			self.add(new self.model({

				echonest_id: response.id,
				text: biography.text,
				site: biography.site,
				url: biography.url,
				timestamp: new Date()

			}));
		});
		return this;
	}

});

module.exports = BiographyCollection;