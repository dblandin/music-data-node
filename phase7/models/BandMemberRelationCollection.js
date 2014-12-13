var bookshelf = require('../../base/bookshelf');
var BandMemberRelation = require('./BandMemberRelation');
var _ = require('underscore');

var BandMemberRelationCollection = bookshelf.Collection.extend({


	model: BandMemberRelation,

	
	extractFromRawResponse: function(response) {
		var self = this;

		if (!_.isString(response.type) || response.type.toLowerCase() !== 'group')
			return this;

		var groupMembers = _.where(response.relations, { type: 'member of band' });

		if (!_.isArray(groupMembers) || _.isEmpty(groupMembers))
			return this;

		_.each(groupMembers, function(groupMember, index) {

			var begin = _.isString(groupMember.begin) ? parseInt(groupMember.begin.split('-')[0]) : null;
			var end = _.isString(groupMember.end) ? parseInt(groupMember.end.split('-')[0]) : null;

			self.add(new self.model({
				band_musicbrainz_id: response.id,
				member_musicbrainz_id: groupMember.artist ? groupMember.artist.id : null,
				begin: _.isNaN(begin) || _.isNull(begin) ? null : begin,
				end: _.isNaN(end) || _.isNull(end) ? null : end,
				timestamp: new Date()
			}));

		});
		return this;
	}

});

module.exports = BandMemberRelationCollection;