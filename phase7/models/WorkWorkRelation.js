var bookshelf = require('../../base/bookshelf');
var _ = require('underscore');

var WorkWorkRelation = bookshelf.Model.extend({

	tableName: 'phase9_5_musicbrainz_work_work'

});

module.exports = WorkWorkRelation;