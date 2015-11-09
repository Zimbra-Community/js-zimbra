/**
 * Common Errors
 */

var errorFactory = require('error-factory');

module.exports = {

    invalidOption: errorFactory(
        'invalidOption',
        {
            'message': "Invalid option specified: {{message}}",
            'messageData': {}
        }
    ),

    systemError: errorFactory(
        'systemError',
        {
            'message': "System error occured: {{message}}",
            'messageData': {}
        }
    )

};