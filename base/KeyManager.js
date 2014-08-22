var Promise = require('bluebird');
var redis = Promise.promisifyAll(require('redis'));
var _ = require('underscore');
var config = require('../config').redis;
var redisUrl = process.env.REDIS_URL || config.url;
var options = require('querystring').parse(redisUrl.query);
var redisClient = redis.createClient(redisUrl.port, redisUrl.hostname, options);
var lock = require('redis-lock')(redisClient, 5000);



var KeyManager = function(args) {
	var keysContainSecrets = _.sample(args.keys).secret;
	
	this.keys = keysContainSecrets ? _.pluck(args.keys, 'key') : args.keys;
	this.keySecretObject = keysContainSecrets ? args.keys : null;

	this.margin = args.margin || 0;
	this.rateLimit = args.rateLimit - args.margin;
	this.timeLimit = args.timeLimit;
	this.keyUsagePerTimeLimit = this.rateLimit;

	this.fifo = [];

	_.bindAll(this, 'getKey', 'getAllKeys', 'setRateLimit', 'deleteAllKeys', 'getSecretForKey');

	/**
	 *  Execute the loop to treat fifoQueue elements.
	 */
	this.loop();
};


KeyManager.prototype = {

	getKey: function(callback) {
		var self = this;
		return new Promise(function(resolve, reject) {
			self.fifo.push({ callback: resolve });
		});
	},


	getAllKeys: function() {
		return this.keys;
	},


	setRateLimit: function(newRateLimit) {
		newRateLimit = newRateLimit <= this.margin ? 0 : newRateLimit - this.margin;
		this.keyUsagePerTimeLimit = newRateLimit;
	},


	deleteAllKeys: function() {
		var self = this;
		return redisClient.delAsync(self.keys[0]).then(function() { redisClient.delAsync(self.keys[1]); });
	},


	getSecretForKey: function(key) {
		if(this.keySecretObject)
			return _.findWhere(this.keySecretObject, {key: key}).secret;
	},


	redisIncrement: function(key) {
		var self = this;
		return redisClient.existsAsync(key).then(function(exists) {

			if(exists)
				return redisClient.incrAsync(key);
			else
				return self.resetKey(key).then(function() {
					return self.redisIncrement(key);
				});
		});
	},


	redisGet: function(key) {
		var self = this;
		return redisClient.existsAsync(key).then(function(exists) {

			if(exists)
				return redisClient.getAsync(key);
			else
				return self.resetKey(key).then(function() {
					return self.redisGet(key);
				});
		});
	},


	resetKey: function(key) {
		var self = this;
		this.keyUsagePerTimeLimit = this.rateLimit;
		return redisClient.setnxAsync(key, 0)

			.then(function(success) {
				if (success)
					return redisClient.expireAsync(key, self.timeLimit/1000);
			});
	},


	/**
	 *  To avoid starvation, the requests received will be stored in a fifo
	 *  queue. This function will periodically check the fifo queue and -
	 *  if there is a request available - it will obtain a valid key and call
	 *  the callback. This function runs recursively.
	 */
	loop: function() {
		var self = this;

		if (_.isEmpty(this.fifo)) {
			_.delay(_.bind(this.loop, this), 31);
			return;
		}
		var next = this.fifo[0];

		Promise.resolve(this.resolveKey())

		.then(function(key) {
			next.callback(key);
			self.fifo = self.fifo.slice(1);
			_.defer(loop);
		})

		.catch(function(exc){
			_.delay(_.bind(self.loop, self), 31);
		});
	},


	/**
	 *  Returns a promise that is resolved if a valid key is found
	 *  and rejected if there are no more available keys. It will also 
	 *  increment the key value in redis.
	 */
	resolveKey: function() {
		self = this;
		return new Promise(function(resolve, reject) {

			Promise.resolve(self.getUsableKey())

			.then(function(key) {
				resolve(key);
			})

			.catch(function(exc) {
				reject('No available keys');
			});
		});
	},


	/**
	 *  Returns a promise that is resolved if a valid key is found.
	 *  Will resolve the promise with the key.
	 */
	getUsableKey: function() {
		var self = this;
		return new Promise(function(resolve, reject) {
			lock('l', function(releaseLock) {

				var keysValuePromises = [];

				for (var i = 0; i < self.keys.length; i++)
					keysValuePromises.push(self.redisGet(self.keys[i]));
				
				Promise.all(keysValuePromises)

				.then(function(values) {

					for (var i = 0; i < values.length; i++)
						if (parseInt(values[i]) < self.keyUsagePerTimeLimit) {
							releaseLock();
							return Promise.resolve(self.redisIncrement(self.keys[i])).then(function() { resolve(self.keys[i]); });
						}

					releaseLock();
					reject('No available keys');
				});
			});
		});
	}
};

module.exports = KeyManager;