var responseOptions = require('../options/response'),
    responseErrors = require('../errors/response'),
    util = require('util');

/**
 * Response-handling API
 *
 */

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

    try {

        this.options =
            new responseOptions.constructor().validate(constructorOptions);

    } catch (err) {

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

    if (this.options.request.isBatch()) {

        if (!this.options.response.hasOwnProperty("BatchResponse")) {

            throw new responseErrors.noBatchResponse(
                undefined,
                {
                    response: util.inspect(this.options.response, false, null)
                }
            );

        }

        var batchResponse = this.options.response.BatchResponse;
        var batchKeys = Object.keys(batchResponse);

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

    if (!id) {

        id = 0;

    }

    return this.response[id];

};

module.exports = ResponseApi;