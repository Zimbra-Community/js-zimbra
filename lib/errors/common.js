var errorFactory = require('error-factory');

/**
 * Common Errors
 */

module.exports = {

    /**
     * Invalid option specified
     *
     * @memberof errors
     */

    invalidOption: errorFactory(
        'invalidOption',
        {
            'message': "Invalid option specified: {{message}}",
            'messageData': {}
        }
    ),

    /**
     * System error
     *
     * @memberof errors
     */

    systemError: errorFactory(
        'systemError',
        {
            'message': "System error occured: {{message}}",
            'messageData': {}
        }
    )

};