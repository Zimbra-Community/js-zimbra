var errorFactory = require('error-factory');

/**
 * Request Errors
 */

module.exports = {

    /**
     * No requests found. Add a request first.
     * @memberof errors
     */

    noRequests: errorFactory(
        'noRequests',
        {
            'message': "There were no requests. Use addRequest first."
        }
    )

};