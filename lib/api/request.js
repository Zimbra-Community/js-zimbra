var requestOptions = require('../options/request'),
    commonErrors = require('../errors/common'),
    requestErrors = require('../errors/request'),
    sprintf = require('sprintf-js').sprintf,
    merge = require('merge');

/**
 * API for request handling
 */

var LOG = console;

/**
 * Request-handling API
 *
 * @param {ResponseConstructorOptions} Options for the
 * constructor
 * @constructor
 * @throws {InvalidOptionError}
 */

function RequestApi(constructorOptions) {
    this.debug = constructorOptions && constructorOptions.debug;

    delete constructorOptions['debug'];

    if (this.debug) {
        LOG.debug('Instantiating new Request object');
        LOG.debug('Validating options');
    }

    try {

        this.options =
            new requestOptions.Constructor().validate(constructorOptions);

    } catch (err) {

        if (this.debug) {
            LOG.error('Received error: %s', err);
        }
        throw(
            err
        );

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

RequestApi.prototype.addRequest = function (originalOptions, callback) {

    var options;
    if (this.debug) {
        LOG.debug('RequestApi#addRequest called');
        LOG.debug('Validating options');
    }

    try {

        options = new requestOptions.AddRequest().validate(originalOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {
            if (this.debug) {
                LOG.error('Invalid options specified: %s', err.message);
            }
            callback(commonErrors.invalidOption(undefined, {
                message: err.message
            }));

        } else {
            if (this.debug) {
                LOG.error('System error: %s', err.message);
            }
            callback(commonErrors.systemError(undefined, {
                message: err.message
            }));

        }

        return;

    }
    if (this.debug) {
        LOG.debug('Creating new request');
    }
    var newRequest = merge({}, options);

    newRequest.params._jsns = sprintf('urn:%s', newRequest.namespace);

    // If this handler is a batch handler, add batch information to the request.

    if (this.options.isBatch) {

        newRequest.params.requestId = this.batchId;

        this.batchId++;

    }

    // Add the request to the request list
    if (this.debug) {
        LOG.debug('Adding new request to stack: %s', JSON.stringify(newRequest));
    }
    this.requests.push(newRequest);

    // Send the request id back to the callback

    if (this.options.batch) {
        if (this.debug) {
            LOG.debug('Returning batch request id %s', newRequest.params.requestId);
        }
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

RequestApi.prototype.getRequest = function (callback) {

    var request = {
        Header: {
            context: this.options.context
        }, Body: {}
    };
    if (this.debug) {
        LOG.debug('RequestApi#getRequest called');
    }
    if (this.requests.length === 0) {
        if (this.debug) {
            LOG.error('No requests in request stack.');
        }
        callback(requestErrors.noRequest());
        return;

    }

    if (this.options.isBatch) {
        if (this.debug) {
            LOG.debug('Handling batch requests');
        }
        request.Body = {
            BatchRequest: {
                _jsns: 'urn:zimbra', onerror: this.options.batchOnError
            }
        };

    }
    if (this.debug) {
        LOG.debug('Building up request pojo');
    }
    // Add context

    request.Header.context._jsns = 'urn:zimbra';
    request.Header.context.format = {
        type: 'js'
    };

    // Build up request

    for (var i = 0; i < this.requests.length; i++) {

        if (this.options.isBatch) {

            if (
                request.Body.BatchRequest.hasOwnProperty(this.requests[i].name)
            ) {

                var batchArray =
                    request.Body.BatchRequest[this.requests[i].name];

                // We have multiple requests with the same name. Use an array

                if (!(
                        batchArray instanceof Array
                    )) {

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
    if (this.debug) {
        LOG.debug('Returning request pojo: %s', JSON.stringify(request));
    }
    callback(null, request);

};

/**
 * Returns wether this request is a batch request
 *
 * @returns {boolean} wether the request is a batch request
 */

RequestApi.prototype.isBatch = function () {
    if (this.debug) {
        LOG.debug('RequestApi#isBatch called');
    }
    return this.options.isBatch;

};

module.exports = RequestApi;
