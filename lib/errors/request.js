/**
 * Request Errors
 */

var errorFactory = require('error-factory');

module.exports = {

    noRequests: errorFactory(
        'noRequests',
        {
            'message': "There were no requests. Use addRequest first."
        }
    )

};