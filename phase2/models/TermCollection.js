var bookshelf = require('../../base/bookshelf');
var Term = require('./Term');
var _ = require('underscore');

var TermCollection = bookshelf.Collection.extend({


	model: Term,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if(!_.isArray(response.terms))
			return;

		_.each(response.terms, function(term) {

			self.add(new self.model({

				echonest_id: 	response.id,
				name: 				term.name,
				frequency: 		term.frequency,
				weight: 			term.weight,
				timestamp: 		new Date()

			}));
		});
		return this;
	}

});

module.exports = TermCollection;