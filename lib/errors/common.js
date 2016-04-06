var errorFactory = require('./factory');

/**
 * Common errors
 *
 */

/**
 * Invalid option specified
 *
 * @constructor
 */

var InvalidOptionError = errorFactory(
    'invalidOption',
    {
        'message': 'Invalid option specified: {{message}}',
        'messageData': {}
    }
);

/**
 * System error
 *
 * @constructor
 */

var SystemError = errorFactory(
    'systemError',
    {
        'message': 'System error occured: {{message}}',
        'messageData': {}
    }
);

/**
 * Common Errors
 */

module.exports = {

    InvalidOption: InvalidOptionError,

    SystemError: SystemError

};
