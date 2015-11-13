var requestOptions = require('../options/request'),
    commonErrors = require('../errors/common'),
    requestErrors = require('../errors/request'),
    util = require('util'),
    merge = require('merge');

/**
 * Request-handling API
 *
 * @param {options.RequestConstructorOptions} see RequestOptions.constructor
 * @memberof api
 * @constructor
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
 * @param {options.AddRequestOptions} originalOptions options for addRequest
 * @param {callback} callback Callback to run with optional error and
 * request object
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

        newRequest.params["requestId"] = this.batchId;

        this.batchId++;

    }

    // Add the request to the request list

    this.requests.push(newRequest);

    // Send the updated object to the callback

    callback(null, this);

};

/**
 * Build up a Zimbra request from the request list and supply it to the callback
 *
 * @param {callback} callback run with optional error and request
 */

RequestApi.prototype.getRequest = function(callback) {

    var request = {
        Header: {
            context: {
                _jsns: "urn:zimbra",
                format: {
                    type: "js"
                }
            }
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

    // Build up request

    for (var i = 0; i < this.requests.length; i++) {

        if (this.options.isBatch) {

            request.Body.BatchRequest[this.requests[i].name] =
                this.requests[i].params;

        } else {

            request.Body[this.requests[i].name] = this.requests[i].params;

        }

    }

    callback(null, request);

};

module.exports = RequestApi;