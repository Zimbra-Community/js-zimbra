/**
 * Communication Errors
 */

var errorFactory = require('error-factory');

module.exports = {

    noToken: errorFactory(
        'noToken',
        {
            'message': "No token has been found. Have you called auth() first?"
        }
    ),
    zimbraError: errorFactory(
        'zimbraError',
        {
            'message': "Got Zimbra error: ({{code}}) {{reason}} | {{detail}}",
            'messageData': {}
        }
    )

};