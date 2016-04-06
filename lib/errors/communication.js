define(['error-factory'], function(errorFactory){

/**
 * Communication Errors
 *
 */

/**
 * No token found. Call auth() first!
 *
 * @constructor
 */

var NoTokenError = errorFactory(
    'noToken',
    {
        'message': 'No token has been found. Have you called auth() first?'
    }
);

/**
 * Internal zimbra error
 *
 * @constructor
 */

var ZimbraError = errorFactory(
    'zimbraError',
    {
        'message': 'Got Zimbra error: ({{code}}) {{reason}} | {{detail}}',
        'messageData': {}
    }
);

return {
  NoToken: NoTokenError,
  ZimbraError: ZimbraError
}

});
