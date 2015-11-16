var baseOption = require('./base').baseOption;

/**
 */

/**
 * Option checking for constructor
 *
 *  * request: Request object resulting in this response
 *  * response: Response POJO that we got from the backend
 *
 * @param {Object} options Options
 * @constructor
 */

function ResponseConstructorOptions() {
    baseOption.call(this);
}

ResponseConstructorOptions.prototype = Object.create(baseOption.prototype);
ResponseConstructorOptions.prototype.constructor = ResponseConstructorOptions;

ResponseConstructorOptions.prototype.validationRules = {
    request: {
        presence: true
    },
    response: {
        presence: true
    }
};

ResponseConstructorOptions.prototype.defaultOptions = {};

module.exports = {
    constructor: ResponseConstructorOptions
};
