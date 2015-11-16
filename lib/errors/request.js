var errorFactory = require('error-factory');

/**
 * Request Errors
 *
 */

/**
 * No requests found. Add a request first.
 * @constructor
 */

var NoRequestsError = errorFactory(
    'noRequests',
    {
        'message': "There were no requests. Use addRequest first."
    }
);

module.exports = {

    noRequests: NoRequestsError

};