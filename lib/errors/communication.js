var errorFactory = require('error-factory');

/**
 * Communication Errors
 */

module.exports = {

    /**
     * No token found. Call auth() first!
     *
     * @memberof errors
     */

    noToken: errorFactory(
        'noToken',
        {
            'message': "No token has been found. Have you called auth() first?"
        }
    ),

    /**
     * Internal zimbra error
     *
     * @memberof errors
     */

    zimbraError: errorFactory(
        'zimbraError',
        {
            'message': "Got Zimbra error: ({{code}}) {{reason}} | {{detail}}",
            'messageData': {}
        }
    )

};