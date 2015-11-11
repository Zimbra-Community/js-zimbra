var optionsApi = require('options-api');

/**
 * Option checking for constructor
 *
 *  * url: URL to Zimbra Soap-API
 *  * token: Pregenerated authentication token
 *  * timeout: Request-Timeout in ms [1800000]
 *
 * @param options Set options
 * @memberof {Object} options Options
 * @constructor
 */

function CommunicationConstructorOptions(options) {
    this.config(options);
}

optionsApi.attach(
    CommunicationConstructorOptions,
    {
        url: "",
        token: "",
        timeout: 1800000
    },
    {
        url: /.+/,
    }
);

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
 * @memberof options
 * @constructor
 */

function AuthOptions(options) {
    this.config(options);
}

optionsApi.attach(
    AuthOptions,
    {
        username: "",
        secret: "",
        isPassword: false,
        isAdmin: false
    },
    {
        username: /.+/,
        secret: /.+/
    }
);

/**
 * Options for getRequest
 *
 *  * noAuth: We don't need an auth token for this request. [false]
 *  * isBatch: Will this be a batch request? [false]
 *  * batchOnError: On Error mode for batch request [stop]
 *  * context: Context parameters (see Zimbra's soap.txt)
 *
 * @param {Object} options Options
 * @memberof options
 * @constructor
 */

function GetRequestOptions(options) {
    this.config(options);
}

optionsApi.attach(
    GetRequestOptions,
    {
        noAuth: false,
        isBatch: false,
        batchOnError: "stop",
        context: {}
    },
    {
        batchOnError: /stop|continue/
    }
);

module.exports = {
    constructor: CommunicationConstructorOptions,
    getRequest: GetRequestOptions,
    auth: AuthOptions
};
