var errorFactory = require('error-factory');

/**
 * Response Errors
 *
 */

/**
 * The request is a BatchRequest, but we didn't found a BatchResponse.
 * @constructor
 */

var NoBatchResponse = errorFactory(
    'noBatchResponse',
    {
        'message': 'The request is a BatchRequest, but we found no' +
        ' BatchResponse in the response: {{response}}'
    }
);

module.exports = {

    NoBatchResponse: NoBatchResponse

};
