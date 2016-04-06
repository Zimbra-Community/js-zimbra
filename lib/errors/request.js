define(['error-factory'], function(errorFactory){

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

return { NoRequests: NoRequestsError }

});
