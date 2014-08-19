var bookshelf = require('../../base/bookshelf');
var Artist = require('./Artist');

var ArtistCollection = bookshelf.Collection.extend({


	model: Artist


});

module.exports = ArtistCollection;