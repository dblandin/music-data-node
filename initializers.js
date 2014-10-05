var amqp = require('amqp');
var config = require('./config').rabbitMq;
var chalk = require('chalk');

var ArtistWorkerPhase0 = require('./phase0/Worker');
var ArtistWorkerPhase1 = require('./phase1/Worker');
var ArtistWorkerPhase2 = require('./phase2/Worker');
var SongWorkerPhase3 = require('./phase3/Worker');
var ArtistWorkerPhase4 = require('./phase4/Worker');
var AlbumWorkerPhase5 = require('./phase5/Worker');
var AlbumWorkerPhase6 = require('./phase6/Worker');

module.exports = {

	initializeRabbitMq: function() {

		var connection = amqp.createConnection(config.connection, config.implementation);

		connection.on('ready', function() {
			connection.queue(config.queueName, config.queueOptions, function(queue) {
				queue.bind('#'); // catch all. Need to specify.
				queue.subscribe({ ack: true }, function(message, headers, deliveryInfo, messageObject) {

					switch (message.phase) {


						case 0:
							if(!message.query) {
								messageObject.acknowledge(false);
								break;
							}
							var worker = new ArtistWorkerPhase0(message.query);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;


						case 1:
							if(!message.query) {
								messageObject.acknowledge(false);
								break;
							}
							var worker = new ArtistWorkerPhase1(message.query);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;


						case 2:
							if(!message.artist) {
								messageObject.acknowledge(false);
								break;
							}
							var worker = new ArtistWorkerPhase2(message.artist);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;


						case 3:
							if(!message.artist) {
								messageObject.acknowledge(false);
								break;
							}
							var worker = new SongWorkerPhase3(message.artist);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;


						case 4:
							if(!message.artist) {
								messageObject.acknowledge(false);
								break;
							}
							var worker = new ArtistWorkerPhase4(message.artist);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;


						case 5:
							if(!message.album) {
								messageObject.acknowledge(false);
								break;
							}
							var worker = new AlbumWorkerPhase5(message.album);
							worker.start(function() {
								console.log(chalk.gray('Message ACKed'));
								messageObject.acknowledge(false);
							});
							break;


						case 6:
							if(!message.track) {
								messageObject.acknowledge(false);
								break;
							}
							var worker = new AlbumWorkerPhase6(message.track);
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