var BaseOption = require('./base').BaseOption;

/**
 * CommunicationApi options
 *
 */

/**
 * Option checking for constructor
 *
 *  * url: URL to Zimbra Soap-API
 *  * token: Pregenerated authentication token
 *  * timeout: Request-Timeout in ms [1800000]
 *
 * @param options Set options
 * @constructor
 */

function CommunicationConstructorOptions() {
    BaseOption.call(this);
}

CommunicationConstructorOptions.prototype = Object.create(BaseOption.prototype);
CommunicationConstructorOptions.prototype.constructor =
    CommunicationConstructorOptions;

CommunicationConstructorOptions.prototype.validationRules = {
    url: {
        presence: true
    }
};

CommunicationConstructorOptions.prototype.defaultOptions = {
    token: '',
    timeout: 10000,
    async: true, // Disable Async Ajax Request
};

/**
 * Option checking for auth
 *
 *
 *  * username: Zimbra-User
 *  * secret: Preauthkey or password
 *  * isPassword: secret is a password [false]
 *  * isAdmin: this is an admin-authentication. currently implies isPassword
 *    [false]
 *
 * @param {Object} options Options
 * @constructor
 */

function AuthOptions() {
    BaseOption.call(this);
}

AuthOptions.prototype = Object.create(BaseOption.prototype);
AuthOptions.prototype.constructor = AuthOptions;

AuthOptions.prototype.validationRules = {
    username: {
        presence: true
    },
    secret: {
        presence: true
    }
};

AuthOptions.prototype.defaultOptions = {
    isPassword: false,
    isAdmin: false
};

/**
 * Options for getRequest
 *
 *  * noAuth: We don't need an auth token for this request. [false]
 *  * isBatch: Will this be a batch request? [false]
 *  * batchOnError: On Error mode for batch request [stop]
 *  * context: Context parameters (see Zimbra's soap.txt)
 *
 * @param {Object} options Options
 * @constructor
 */

function GetRequestOptions() {
    BaseOption.call(this);
}

GetRequestOptions.prototype = Object.create(BaseOption.prototype);
GetRequestOptions.prototype.constructor = GetRequestOptions;

GetRequestOptions.prototype.validationRules = {
    batchOnError: {
        format: /stop|continue/
    }
};

GetRequestOptions.prototype.defaultOptions = {
    noAuth: false,
    isBatch: false,
    batchOnError: 'stop',
    context: {}
};

module.exports = {
    Constructor: CommunicationConstructorOptions,
    GetRequest: GetRequestOptions,
    Auth: AuthOptions
};
