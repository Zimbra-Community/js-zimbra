var errorFactory = require('./factory');

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
        'message': 'There were no requests. Use addRequest first.'
    }
);

module.exports = {

    NoRequests: NoRequestsError

};
