var amqp = require('amqp');
var config = require('./config').rabbitMq;
var ArtistWorkerPhase2 = require('./phase2/Worker');
var SongWorkerPhase3 = require('./phase3/Worker');
var chalk = require('chalk');

module.exports = {

	initializeRabbitMq: function() {

		var connection = amqp.createConnection(config.connection, config.implementation);

		connection.on('ready', function() {

			connection.queue(config.queueName, config.queueOptions, function(queue) {

				queue.bind('#'); // catch all. Need to specify.

				queue.subscribe({ ack: true }, function(message, headers, deliveryInfo, messageObject) {

					switch (message.phase) {

						/**
						 * Phase 1 - Artist recollection.
						 */
						case 1:
							return new Error('Phase 1 not implemented');

						/**
						 * Phase 2 - Artist information from EchoNest.
						 */	
						case 2:
							var worker = new ArtistWorkerPhase2(message.artist);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;

						/**
						 * Phase 3 - Song information from EchoNest.
						 */	
						case 3:
							var worker = new SongWorkerPhase3(message.artist);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;

					}
				});
			});

			console.log('Connected');

		}).on('error', function(error) {
			console.log(error);
		});

		return connection;
	}

};