var assert = require('assert');
var should = require('should');
var mocha = require('mocha');
var KeyManager = require('../base/KeyManager');
var Promise = require('bluebird');

var keyManager = new KeyManager({
	keys: ['a', 'b', 'c', 'd', 'e'],
	margin: 0,
	rateLimit: 1,
	timeLimit: 5000
});


describe('Key master test suite', function() {

	it('should deliver keys immediatly if ready', function(done) {
		var date = new Date();
		var opts = {
			timeTolerance: 50,
			delay: 1000,
			time: date.getTime()
		};

		Promise.resolve(keyManager.getKey()).bind(opts).then(function(key){
			var delay = new Date().getTime() - opts.time;

			key.should.eql('a');
			delay.should.be.below(opts.timeTolerance);

			opts.time = new Date().getTime();
		}).delay(opts.delay)

		.then(keyManager.getKey).then(function(key) {
			var delay = new Date().getTime() - opts.time;

			key.should.eql('b');
			delay.should.be.below(opts.timeTolerance + opts.delay);

			opts.time = new Date().getTime();
		}).delay(opts.delay)

		.then(keyManager.getKey).then(function(key) {
			var delay = new Date().getTime() - opts.time;

			key.should.eql('c');
			delay.should.be.below(opts.timeTolerance + opts.delay);

			opts.time = new Date().getTime();
		}).delay(opts.delay)

		.then(keyManager.getKey).then(function(key) {
			var delay = new Date().getTime() - opts.time;

			key.should.eql('d');
			delay.should.be.below(opts.timeTolerance + opts.delay);

			opts.time = new Date().getTime();
		}).delay(opts.delay)

		.then(keyManager.getKey).then(function(key) {
			var delay = new Date().getTime() - opts.time;

			key.should.eql('e');
			delay.should.be.below(opts.timeTolerance + opts.delay);

			opts.time = new Date().getTime();
		})

		.then(function(){
			done();
		})

		.catch(function (err) {
      done(err);
    });

	});

});

