var bookshelf = require('../../base/bookshelf');
var WorkWorkRelation = require('./WorkWorkRelation');
var _ = require('underscore');

var WorkCollection = bookshelf.Collection.extend({


	model: WorkWorkRelation,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.works))
			return this;

		_.each(response.works, function(work, index) {

			for (var i = 0; i < work.relations.length; i++) {
				
				if(!work.relations[i].work)
					continue;

				self.add(new self.model({

					work: work.id,
				  related_work: work.relations[i].work.id,
				  type: work.relations[i].work.type

				}));
			};
		});
		return this;
	}

});

module.exports = WorkCollection;