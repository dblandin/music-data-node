var assert = require('assert');
var should = require('should');
var mocha = require('mocha');
var KeyManager = require('../base/KeyManager');
var Promise = require('bluebird');
var _ = require('underscore');


describe('Key master test suite', function() {

	// it('should deliver keys immediatly if ready', function(done) {
	// 	var date = new Date();

	// 	var keyManager = new KeyManager({
	// 		keys: ['a', 'b', 'c', 'd', 'e'],
	// 		margin: 0,
	// 		rateLimit: 1,
	// 		timeLimit: 5000
	// 	});

	// 	var opts = {
	// 		timeTolerance: 50,
	// 		delay: 1000,
	// 		time: date.getTime()
	// 	};

	// 	Promise.resolve(keyManager.getKey()).bind(opts).then(function(key){
	// 		var delay = new Date().getTime() - opts.time;

	// 		key.should.eql('a');
	// 		delay.should.be.below(opts.timeTolerance);

	// 		opts.time = new Date().getTime();
	// 	}).delay(opts.delay)

	// 	.then(keyManager.getKey).then(function(key) {
	// 		var delay = new Date().getTime() - opts.time;

	// 		key.should.eql('b');
	// 		delay.should.be.below(opts.timeTolerance + opts.delay);

	// 		opts.time = new Date().getTime();
	// 	}).delay(opts.delay)

	// 	.then(keyManager.getKey).then(function(key) {
	// 		var delay = new Date().getTime() - opts.time;

	// 		key.should.eql('c');
	// 		delay.should.be.below(opts.timeTolerance + opts.delay);

	// 		opts.time = new Date().getTime();
	// 	}).delay(opts.delay)

	// 	.then(keyManager.getKey).then(function(key) {
	// 		var delay = new Date().getTime() - opts.time;

	// 		key.should.eql('d');
	// 		delay.should.be.below(opts.timeTolerance + opts.delay);

	// 		opts.time = new Date().getTime();
	// 	}).delay(opts.delay)

	// 	.then(keyManager.getKey).then(function(key) {
	// 		var delay = new Date().getTime() - opts.time;

	// 		key.should.eql('e');
	// 		delay.should.be.below(opts.timeTolerance + opts.delay);

	// 		opts.time = new Date().getTime();
	// 	})

	// 	.then(function(){
	// 		done();
	// 	})

	// 	.catch(function (err) {
 //      done(err);
 //    });
	// });

	it('should not deliver the same key in less than the time limit', function(done) {

		var date = new Date();
		var opts = { keys: ['a', 'b'], margin: 9, rateLimit: 10, timeLimit: 1000 }; // should only fetch one per time limit.
		var keyManager = new KeyManager(opts);

		var keysInUse = []; // Stores the key in use and the time it was given

		var onKeyReceived = function(key){
			console.log('Key obtained: ' + key);
			var keyInUse = _.findWhere(keysInUse, { key: key });
			var currentDate = new Date();
			
			if(!keyInUse) return keysInUse.push({ key: key, timestamp: currentDate });

			var timeDifference = currentDate.getTime() - keyInUse.timestamp.getTime();
			console.log('Time difference with previous key: ' + timeDifference);
			timeDifference.should.not.be.below(opts.timeLimit);
			keyInUse.timestamp = currentDate;
		};

		// Ask for 10 keys
		Promise.resolve(keyManager.getKey()).then(onKeyReceived)
		.then(keyManager.getKey).then(onKeyReceived)
		.then(keyManager.getKey).then(onKeyReceived)
		.then(keyManager.getKey).then(onKeyReceived)
		.then(keyManager.getKey).then(onKeyReceived)
		.then(keyManager.getKey).then(onKeyReceived)
		.then(keyManager.getKey).then(onKeyReceived)
		.then(keyManager.getKey).then(onKeyReceived)
		.then(keyManager.getKey).then(onKeyReceived)
		.then(keyManager.getKey).then(onKeyReceived)

		.then(function() { done(); })
		.catch(function(err) { done(err); });
	});
});

