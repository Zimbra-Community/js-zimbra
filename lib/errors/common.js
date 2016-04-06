define(['error-factory'], function(errorFactory){

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

return {
  InvalidOption: InvalidOptionError,
  SystemError: SystemError,
}

});
