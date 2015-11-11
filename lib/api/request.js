/**
 * Request handler
 */

var requestOptions = require('./options/request'),
    commonErrors = require('../errors/common'),
    requestErrors = require('../errors/request'),
    util = require('util');

/**
 * Constructor for API
 *
 * @param constructorOptions see RequestOptions.constructor
 * @constructor
 */

function RequestApi(constructorOptions) {

    this.options = new requestOptions.constructor(constructorOptions);

    this.requests = [];
    this.batchId = 1;

}

/**
 * Add a request to this handler
 *
 * @param originalOptions see RequestOptions.addRequest
 * @param callback Callback to run when requests are added
 */

RequestApi.prototype.addRequest = function(originalOptions, callback) {

    try {

        options = new requestOptions.addRequest(originalOptions);

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

    var newRequest = options.list();

    newRequest.params._jsns = util.format(
        "urn:%s",
        newRequest.namespace
    );

    // If this handler is a batch handler, add batch information to the request.

    if (this.options.get("isBatch")) {

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
 * @param callback Error?, request
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

    if (this.options.get("isBatch")) {

        request.Body = {
            BatchRequest: {
                _jsns: "urn:zimbra",
                onerror: this.options.get("batchOnError")
            }
        };

    }

    // Build up request

    for (var i = 0; i < this.requests.length; i++) {

        if (this.options.get("isBatch")) {

            request.Body.BatchRequest[this.requests[i].name] =
                this.requests[i].params;

        } else {

            request.Body[this.requests[i].name] = this.requests[i].params;

        }

    }

    callback(null, request);

};

module.exports = RequestApi;