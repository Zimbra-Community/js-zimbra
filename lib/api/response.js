var responseOptions = require('../options/response'),
    responseErrors = require('../errors/response'),
    util = require('util'),
    winston = require('winston');

/**
 * Response-handling API
 */

var LOG = winston.loggers.get("js-zimbra");

/**
 * Response-handling API
 *
 * @param {ResponseConstructorOptions} constructorOptions
 * Options for the constructor
 * @constructor
 * @throws {NoBatchResponse}
 * @throws {InvalidOptionError}
 */

function ResponseApi(constructorOptions) {

    LOG.debug("Instantiating new response object");
    LOG.debug("Validating options");

    try {

        this.options =
            new responseOptions.constructor().validate(constructorOptions);

    } catch (err) {

        LOG.error("Received error: %s", err);

        throw(err);

    }

    this.response = {};
    this.isBatch = false;

    this._createResponseView();

}

/**
 * Create an internal representation of the response POJO to make it more
 * accessible by other methods
 *
 * @throws {NoBatchResponse}
 * @private
 */

ResponseApi.prototype._createResponseView = function () {

    LOG.debug("ResponseApi#_createResponseView called");

    if (this.options.request.isBatch()) {

        LOG.debug("Handling batch response");

        if (!this.options.response.hasOwnProperty("BatchResponse")) {

            LOG.debug("Batch request found, but no batch response received");

            throw new responseErrors.noBatchResponse(
                undefined,
                {
                    response: util.inspect(this.options.response, false, null)
                }
            );

        }

        var batchResponse = this.options.response.BatchResponse;
        var batchKeys = Object.keys(batchResponse);

        LOG.debug("Collecting batch responses");

        for (var i=0; i < batchKeys.length; i++) {

            if (batchResponse[batchKeys[i]] instanceof Array) {

                // Handle BatchResponses of same name

                var subResponse = batchResponse[batchKeys[i]];

                for (var a = 0; a < subResponse.length; a++) {

                    this.response[subResponse[a]["requestId"]] = {};

                    this.response[subResponse[a]["requestId"]][batchKeys[i]] =
                        subResponse[a];

                }

            } else {

                this.response[batchResponse[batchKeys[i]]["requestId"]] =
                    batchResponse[i];

            }

        }

        this.isBatch = true;

    } else {

        LOG.debug("Saving response");

        this.response[0] = this.options.response;

    }

};

/**
 * Retrieve a specific response (in a batch response) or the only available
 * response
 *
 * @param {int} id Original RequestID
 */

ResponseApi.prototype.get = function(id) {

    LOG.debug("ResponseApi#get called");

    if (!id) {

        id = 0;

    }

    return this.response[id];

};

module.exports = ResponseApi;