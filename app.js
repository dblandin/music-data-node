var express = require('express');
var http = require('http');
var path = require('path');
var init = require('./initializers');

var connection;
var bookshelf;

var app = module.exports = express();

app.use(express.urlencoded());
app.use(express.methodOverride());


// development only
if ('development' == app.get('env'))
  app.use(express.errorHandler());


connection = init.initializeRabbitMq();


// closing
process.on('SIGTERM', function () {
  console.log('Closing');
  app.close();
});

app.on('close', function() {
	if (connection)
		connection.disconnect();
});