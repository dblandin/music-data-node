var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').echonest;
var _ = require('underscore');

var echonestFetcher = {

	makeRequest: function(options) {
		var self = this;
		return request(options).then(function(response) {

			self.updateKeyRateLimit(response)
			var error = self.getErrorFromResponse(response);

			if(error)
				throw (error)
			else
				return response;
		});
	},


	getErrorFromResponse: function(response) {
		if (JSON.parse(response[1]).response.status.message.toLowerCase() !== 'success')
			return JSON.parse(response[1]).response.status.message;

		return false;
	},


	updateKeyRateLimit: function(response) {
		if (response && _.isArray(response) && !_.isEmpty(response) && response[0].headers && response[0].headers['x-ratelimit-limit']) 
			keymaster.setRateLimit(parseInt(response[0].headers['x-ratelimit-limit']));		
	}
};


module.exports = echonestFetcher;