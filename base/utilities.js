var _ = require('underscore');

module.exports = {

	// Extract the actual id attribute of foreign ids as returned
	// by Echonest as part of the Rossetta project.
	getFirstForeignId: function(catalog, foreignIds) {
		var rawId = _.findWhere(foreignIds, { catalog: catalog });
		if(rawId && rawId.foreign_id) 
			return rawId.foreign_id.split(':').pop();
	},

	getAllForeignIds: function(catalog, foreignIds) {
		var rawIds = _.where(foreignIds, { catalog: catalog });

		return _.map(rawIds, function(rawId) {
			return rawId.foreign_id.split(':').pop();
		});
	}
}