var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var keymaster = require('../../base/keymaster').echonest;
var _ = require('underscore');

var echonestFetcher = {

	makeRequest: function(options) {
		var self = this;
		return request(options).then(function(response) {

			var error = self.getErrorFromResponse(response);

			if(error) {
				if(error.retry && _.isNumber(self.retryCount) && _.isNumber(self.retryLimit) && self.retryCount<self.retryLimit)
					return null;
				else
					throw (error.message);
			}

			else
				return response;
		});
	},


	getErrorFromResponse: function(response) {
		var parsedResponse = JSON.parse(response[1]);

		if (!_.isString(parsedResponse) && !parsedResponse)
			return 'Missing response from LastFm.';

		if (parsedResponse.error)
			return this.errors[parsedResponse.error];

		return false;
	},


	errors: {
		2: { 
			message: 'Invalid service - This service does not exist', 
			retry: false
		},
		3: { 
			message: 'Invalid Method - No method with that name in this package', 
			retry: false
		},
		4: { 
			message: 'Authentication Failed - You do not have permissions to access the service', 
			retry: true
		},
		5: { 
			message: 'Invalid format - This service doesn\'t exist in that format', 
			retry: true
		},
		6: { 
			message: 'Invalid parameters - Your request is missing a required parameter', 
			retry: false
		},
		7: { 
			message: 'Invalid resource specified', 
			retry: true
		},
		8: { 
			message: 'Operation failed - Something else went wrong', 
			retry: true
		},
		9: { 
			message: 'Invalid session key - Please re-authenticate', 
			retry: true
		},
		10: { 
			message: 'Invalid API key - You must be granted a valid key by last.fm', 
			retry: true
		},
		11: { 
			message: 'Service Offline - This service is temporarily offline. Try again later.', 
			retry: true
		},
		13: { 
			message: 'Invalid method signature supplied', 
			retry: false
		},
		16: { 
			message: 'There was a temporary error processing your request. Please try again', 
			retry: true
		},
		26: { 
			message: 'Suspended API key - Access for your account has been suspended, please contact Last.fm', 
			retry: false
		},
		29: { 
			message: 'Rate limit exceeded - Your IP has made too many requests in a short period', 
			retry: true
		}
	}
};


module.exports = echonestFetcher;