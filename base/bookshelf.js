var knex = require('knex');
var bookshelf = require('bookshelf');
var config = require('../config').database;
var Promise = require('bluebird');

console.log('initializing bookshelf');

var queryBuilder = knex({
	client: 'pg',
	connection: {
		host: config.host,
		port: config.port,
		user: config.user,
		password: config.password,
		database: config.database,
		charset: config.charset
	}
});

var bookshelfInstance = bookshelf(queryBuilder);

bookshelfInstance.Collection.prototype.saveAll = function(parameters, options) {
	return Promise.map(this.models, function(model) {
		return model.save(parameters, options);
	});
};

bookshelfInstance.Collection.prototype.insertAll = function() {
	if(this.isEmpty() || !this.model.prototype.tableName)
		return;
	
	return bookshelfInstance.knex(this.model.prototype.tableName).insert(this.toJSON());
};

module.exports = bookshelfInstance;