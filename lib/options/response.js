var BaseOption = require('./base').BaseOption;

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
    BaseOption.call(this);
}

ResponseConstructorOptions.prototype = Object.create(BaseOption.prototype);
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
    Constructor: ResponseConstructorOptions
};
