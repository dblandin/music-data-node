var amqp = require('amqp');
var config = require('./config').rabbitMq;
var ArtistWorkerPhase2 = require('./phase2/Worker');
var SongWorkerPhase3 = require('./phase3/Worker');
var ArtistWorkerPhase4 = require('./phase4/Worker');
var chalk = require('chalk');

module.exports = {

	initializeRabbitMq: function() {

		var connection = amqp.createConnection(config.connection, config.implementation);

		connection.on('ready', function() {
			connection.queue(config.queueName, config.queueOptions, function(queue) {
				queue.bind('#'); // catch all. Need to specify.
				queue.subscribe({ ack: true }, function(message, headers, deliveryInfo, messageObject) {

					switch (message.phase) {


						case 1:
							messageObject.acknowledge(false);
							return new Error('Phase 1 not implemented');


						case 2:
							var worker = new ArtistWorkerPhase2(message.artist);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;


						case 3:
							var worker = new SongWorkerPhase3(message.artist);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;


						case 4:
							var worker = new ArtistWorkerPhase4(message.artist);
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