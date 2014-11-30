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
	this.timeLimit = args.timeLimit + 5; // 5 milliseconds to compensate for redis inaccuracy
	this.keyUsagePerTimeLimit = this.rateLimit;

	this.fifo = [];

	_.bindAll(this, 'getKey', 'getAllKeys', 'setRateLimit', 'deleteAllKeys', 'getSecretForKey');

	this.loop();
};


KeyManager.prototype = {

	getKey: function(callback) {
		var self = this;

		return new Promise(function(resolve, reject) {
			self.fifo.push({ callback: resolve });
			if(self.fifo.length === 1)
				self.loop();
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
		var keysValuePromises = [];
		for (var i = 0; i < self.keys.length; i++)
			keysValuePromises.push(redisClient.delAsync(self.keys[i]));
		
		return Promise.all(keysValuePromises)

		.then(function(values) {
			console.log('All keys reset');
		});
	},


	canUseKey: function(key) {
		var self = this;
		var atomicScript = 'local current;current = redis.call("incr", KEYS[1]);if tonumber(current) == 1 then redis.call("pexpire",  KEYS[1], ' + self.timeLimit + ');end;return current;';

		return redisClient.evalAsync(atomicScript, 1, key)

		.then(function(value) {
			return (value <= self.keyUsagePerTimeLimit);
		});
	},


	getSecretForKey: function(key) {
		if(this.keySecretObject)
			return _.findWhere(this.keySecretObject, {key: key}).secret;
	},


	/**
	 *  To avoid starvation, the requests received will be stored in a fifo
	 *  queue. This function will periodically check the fifo queue and -
	 *  if there is a request available - it will obtain a valid key and call
	 *  the callback. This function runs recursively.
	 */
	loop: function() {
		var self = this;

		if (_.isEmpty(this.fifo))
			return;
		
		var next = this.fifo[0];

		Promise.resolve(this.getUsableKey())

		.then(function(key) {
			next.callback(key);
			self.fifo = self.fifo.slice(1);
			_.defer(_.bind(self.loop, self));
		})

		.catch(function(exc){
			_.defer(_.bind(self.loop, self));
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

				var keyIndex = 0;

				var iterator = function() {
					return self.canUseKey(self.keys[keyIndex])

					.then(function(useKey) {
						if(useKey) {

							releaseLock();
							resolve(self.keys[keyIndex]);
							return;

						} else {

							keyIndex++;
							if(keyIndex >= self.keys.length) {
								releaseLock();
								reject('No available keys');
								return;
							}

							return iterator();
						}
					})
				};
	
				iterator();
			});
		});
	}
};

module.exports = KeyManager;