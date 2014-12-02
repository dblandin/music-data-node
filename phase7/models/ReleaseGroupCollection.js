var bookshelf = require('../../base/bookshelf');
var ReleaseGroup = require('./ReleaseGroup');
var _ = require('underscore');

var ReleaseGroupCollection = bookshelf.Collection.extend({


	model: ReleaseGroup,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isArray(response.releaseGroups))
			return this;

		_.each(response.releaseGroups, function(releaseGroup, index) {

			self.add(new self.model({

				mbid: releaseGroup.id,
			  title: releaseGroup.title,
			  primary_type: releaseGroup['primary-type'],
			  secondary_type: releaseGroup['secondary-type'],
			  release_count: releaseGroup.releases ? releaseGroup.releases.length : 0,
				timestamp: new Date()

			}));
		});
		return this;
	}

});

module.exports = ReleaseGroupCollection;