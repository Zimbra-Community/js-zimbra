var requestOptions = require('../options/request'),
    commonErrors = require('../errors/common'),
    requestErrors = require('../errors/request'),
    util = require('util'),
    merge = require('merge');

/**
 * API for request handling
 *
 */

/**
 * Request-handling API
 *
 * @param {ResponseConstructorOptions} Options for the
 * constructor
 * @constructor
 * @throws {InvalidOptionError}
 */

function RequestApi(constructorOptions) {

    try {

        this.options =
            new requestOptions.constructor().validate(constructorOptions);

    } catch (err) {

        throw(err);

    }

    this.requests = [];
    this.batchId = 1;

}

/**
 * Add a request to this handler
 *
 * @param {AddRequestOptions} originalOptions options for
 * addRequest
 * @param {callback} callback Callback to run with optional error (see
 * throws) and the id of the last request (when in batch mode)
 * @throws {InvalidOptionError}
 * @throws {SystemError}
 */

RequestApi.prototype.addRequest = function(originalOptions, callback) {

    var options;

    try {

        options = new requestOptions.addRequest().validate(originalOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {

            callback(
                commonErrors.invalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {

            callback(
                commonErrors.systemError(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        }

        return;

    }

    var newRequest = merge({}, options);

    newRequest.params._jsns = util.format(
        "urn:%s",
        newRequest.namespace
    );

    // If this handler is a batch handler, add batch information to the request.

    if (this.options.isBatch) {

        newRequest.params.requestId = this.batchId;

        this.batchId++;

    }

    // Add the request to the request list

    this.requests.push(newRequest);

    // Send the request id back to the callback

    if (this.options.batch) {

        callback(null, newRequest.params.requestId);

    } else {

        callback(null);

    }

};

/**
 * Build up a Zimbra request from the request list and supply it to the callback
 *
 * @param {callback} callback run with optional error (see throws) and request
 * @throws {NoRequestsError}
 */

RequestApi.prototype.getRequest = function(callback) {

    var request = {
        Header: {
            context: this.options.context
        },
        Body: {

        }
    };

    if (this.requests.length === 0) {

        callback(requestErrors.noRequest());
        return;

    }

    // Handle batch requests

    if (this.options.isBatch) {

        request.Body = {
            BatchRequest: {
                _jsns: "urn:zimbra",
                onerror: this.options.batchOnError
            }
        };

    }

    // Add context

    request.Header.context._jsns = "urn:zimbra";
    request.Header.context.format = {
        type: "js"
    };

    // Build up request

    for (var i = 0; i < this.requests.length; i++) {

        if (this.options.isBatch) {

            if (
                request.Body.BatchRequest.hasOwnProperty(
                    this.requests[i].name
                )
            ) {

                var batchArray = request.Body.BatchRequest[
                    this.requests[i].name
                ];

                // We have multiple requests with the same name. Use an array

                if (!(batchArray instanceof Array)) {

                    batchArray = [batchArray];

                }

                batchArray.push(this.requests[i].params);

                request.Body.BatchRequest[this.requests[i].name] = batchArray;

            } else {

                request.Body.BatchRequest[this.requests[i].name] =
                    this.requests[i].params;

            }

        } else {

            request.Body[this.requests[i].name] = this.requests[i].params;

        }

    }

    callback(null, request);

};

/**
 * Returns wether this request is a batch request
 *
 * @returns {boolean} wether the request is a batch request
 */

RequestApi.prototype.isBatch = function() {

    return this.options.isBatch;

};

module.exports = RequestApi;