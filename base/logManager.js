var winston = require('winston');

var config = {
	supportFileLogging: true,

  levels: {
    silly: 0,
    verbose: 1,
    info: 2,
    data: 3,
    warn: 4,
    debug: 5,
    error: 6
  },
  colors: {
    silly: 'magenta',
    verbose: 'cyan',
    info: 'green',
    data: 'grey',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
  }
};


var Logger = {
	
	getLoggerForFile: function(filePath) {

		var transports = [
			new (winston.transports.Console)({
	      colorize: true
	    })
		];

		if(config.supportFileLogging) {
			transports.push(new (winston.transports.File)({ 
				filename: filePath,
				colorize: true
			}));
		}

		return new (winston.Logger)({
			transports: transports,
			levels: config.levels,
			colors: config.colors
		});

	}

};

module.exports = Logger;
