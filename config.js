// Set NODE_ENV=production or NODE_ENV=development. E.g., NODE_ENV=production nodemon app.js

/**
 * Development config elements
 */
var development = {

	rabbitMq: {
		connection: {
			host: 'localhost', 
			port: 5672,
			login: 'guest',
			password: 'guest',
			connectionTimeout: 0,
			authMechanism: 'AMQPLAIN',
			vhost: '/',
			noDelay: true,
			ssl: { enabled : false }
		},
		
		implementation: {
			defaultExchangeName: 'music.topic',
			reconnect: true, 
			reconnectBackoffStrategy: 'linear', 
			reconnectExponentialLimit: 120000, 
			reconnectBackoffTime: 1000
		},

		queueName: 'music-queue', // Queue name

		queueOptions: {
			passive: false,
			durable: false,
			exclusive: false,
			autoDelete: true,
			noDeclare: false,
			closeChannelOnUnsubscribe: false
		}
	},

	database: {
		host: 'localhost',
		port: 5432,
		user: 'usuario',
		password: '',
		database: 'music_data_dev',
		charset: 'utf8'
	},

	redis: {
		url: {
			port: 6379,
			hostname: '127.0.0.1'
		}
	}
};

/**
 * Production config elements
 */
var production = {

	rabbitMq: {
		connection: {
			host: '10.128.230.150', 
			// host: '107.170.110.40', 
			port: 5672,
			login: 'musicdata',
			password: 'UmifHiRXq74xyckG',
			connectionTimeout: 0,
			authMechanism: 'AMQPLAIN',
			vhost: '/musicdata',
			noDelay: true,
			ssl: { enabled : false }
		},
		
		implementation: {
			defaultExchangeName: 'music.topic',
			reconnect: true, 
			reconnectBackoffStrategy: 'linear', 
			reconnectExponentialLimit: 120000, 
			reconnectBackoffTime: 1000
		},

		queueName: 'music-queue',

		queueOptions: {
			passive: false,
			durable: false,
			exclusive: false,
			autoDelete: true,
			noDeclare: false,
			closeChannelOnUnsubscribe: false
		}
	},

	database: {
		host: '10.128.177.237',
		// host: '107.170.133.156',
		port: 48189,
		user: 'musicdata',
		password: 'SsD7N4krmQxnQjgzCXzLvmMoQv8ewH9MfssMdvJresAumjToze',
		database: 'music_data',
		charset: 'utf8'
	},

	redis: {
		url: {
			port: 6379,
			hostname: '10.128.177.237'
			// hostname: '107.170.133.156'
		}
	}
};

var env = process.env.NODE_ENV || 'development';
var config;

if (env === 'development') {
	config = development;
	console.log('Running under development');
}
	

if (env === 'production') {
	config = production;
	console.log('Running under production');
}
	


module.exports = config;