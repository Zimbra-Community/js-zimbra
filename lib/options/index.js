/**
 * @namespace options
 */

var validate = require('validate.js'),
    commonErrors = require('../errors/common');

/**
 * A base class for option handling
 * @constructor
 */

function BaseOption() {
}

/**
 * A list of validate.js-validation rules
 *
 * @type {{}}
 */

BaseOption.prototype.validationRules = {};

/**
 * Default options used for this object
 *
 * @type {{}}
 */

BaseOption.prototype.defaultOptions = {};

/**
 * Validate the given options (merged together with the default options)
 * against the validation rules.
 *
 * Returns the options with the default options set. May throw an
 * {@code errors.invalidOption} error.
 *
 * @param validateOptions options to be validated
 * @return options with default options
 */

BaseOption.prototype.validate = function (validateOptions) {

    var options = this.defaultOptions;

    // Merge given options with default options

    validate.extend(options, validateOptions);

    // Validate options

    var validationResults = validate(options, this.validationRules);

    if (typeof validationResults !== "undefined") {

        throw commonErrors.invalidOption(
            undefined,
            {
                message: validationResults
            }
        );

    }

    return options;

};

module.exports = {
    baseOption: BaseOption
};