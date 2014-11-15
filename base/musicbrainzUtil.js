var Promise = require('bluebird');
var Nodebrainz = require('nodebrainz');

module.exports = Promise.promisifyAll(new Nodebrainz({ userAgent:'music-data/0.0.1', defaultLimit:100 }));