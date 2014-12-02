var knex = require('knex');
var bookshelf = require('bookshelf');
var config = require('../config').database;
var _ = require('underscore');
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

bookshelfInstance.Collection.prototype.gradualSave = function() {
	var limit = 30;
	var subsections = [];
	var self = this;

	while((subsections.length * limit) < this.length)
		subsections.push(this.slice((subsections.length * limit), (limit + (subsections.length * limit))));
	
	return Promise.map(subsections, function(subsection) {
		var toSave = _.map(subsection, function(model){ return model.toJSON(); });
		return bookshelfInstance.knex(self.model.prototype.tableName).insert(toSave);
	});
};

module.exports = bookshelfInstance;