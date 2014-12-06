var bookshelf = require('../../base/bookshelf');
var Work = require('./Work');
var _ = require('underscore');

var WorkCollection = bookshelf.Collection.extend({


	model: Work,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.works))
			return this;

		_.each(response.works, function(work, index) {

			self.add(new self.model({

				mbid: work.id,
			  title: work.title,
			  type: work.type,
				timestamp: new Date()

			}));
		});
		return this;
	}

});

module.exports = WorkCollection;