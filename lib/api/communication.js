var communicationOptions = require('../options/communication'),
    communicationErrors = require('../errors/communication'),
    commonErrors = require('../errors/common'),
    requestApi = require('./request'),
    responseApi = require('./response'),
    preauthUtil = require('../utils/preauth'),
    restler = require('restler'),
    util = require('util'),
    merge = require('merge');

/**
 * Communications handling
 *
 */

/**
 * Communications-Handling API
 *
 * @param {CommunicationConstructorOptions} constructorOptions
 * Options for constructor
 * @constructor
 * @throws {InvalidOptionError}
 */

function CommunicationApi(constructorOptions) {

    // Sanitize option eventually throwing an InvalidOption

    try {

        this.options =
            new communicationOptions.constructor().validate(constructorOptions);

    } catch (err) {

        throw(
            err
        );

    }

    if (this.options.token !== "") {

        this.token = this.options.token;

    } else {

        this.token = null;

    }

}

/**
 * Handle the response from sending the auth request
 *
 * @param callback Callback from auth()
 * @param err Optional errors by send()
 * @param response The response
 * @private
 * @throws {SystemError}
 */

CommunicationApi.prototype._handleAuthResponse =
    function (callback, err, response) {

        if (err) {

            callback(err);
            return;

        }

        if (!response.get().hasOwnProperty("AuthResponse")) {

            callback(commonErrors.systemError(
                "Didn't find AuthResponse in response: {{message}} ",
                {
                    message: util.inspect(response, false, null)
                }));
            return;

        }

        // Set the auth token

        this.token = response.get().AuthResponse.authToken[0]._content;

        // We're through. Call the callback.

        callback(null);

    };

/**
 * Handle the generated secret (preauth key or password), build up the
 * auth request and send it
 *
 * @param options Options from auth()
 * @param callback Callback from auth()
 * @param err Optional errors from the call
 * @param secret Generated secret (preauth key or password)
 * @private
 */

CommunicationApi.prototype._authSecret =
    function (options, callback, err, secret) {

        var that = this;

        if (err) {

            callback(err);
            return;

        }

        this.getRequest({
            noAuth: true
        }, function (err, request) {

            if (err) {

                callback(err);
                return;

            }

            var requestParams = {
                account: {
                    by: "name", _content: options.username
                }
            };

            var ns = "zimbraAccount";

            if (options.isAdmin) {

                ns = "zimbraAdmin";
                requestParams.password = secret;

            } else if (options.isPassword) {

                requestParams.password = {
                    _content: secret
                };

            } else {

                requestParams.preauth = {
                    timestamp: options.timestamp, expires: 0, _content: secret
                };

            }

            request.addRequest({
                name: "AuthRequest", params: requestParams, namespace: ns
            }, function (err) {

                if (err) {

                    callback(err);
                    return;

                }

                // Send out request

                that.send(request,
                    that._handleAuthResponse.bind(that, callback));

            });

        });

    };

/**
 * Authenticate against Zimbra.
 *
 * @param {AuthOptions} originalOptions options for auth
 * @param {callback} callback Callback run with optional error (see throws)
 * @throws {SystemError}
 * @throws {InvalidOptionError}
 */

CommunicationApi.prototype.auth = function (originalOptions, callback) {

    var options;

    try {

        options = new communicationOptions.auth().validate(originalOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {

            callback(
                commonErrors.invalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {

            callback(
                commonErrors.systemError(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        }

        return;

    }

    var isPassword = options.isPassword;

    if (options.isAdmin) {

        isPassword = true;

    }

    // Clone options into request options

    var requestOptions = merge({}, options);

    requestOptions.isPassword = isPassword;
    requestOptions.timestamp = new Date().getTime();

    if (!isPassword) {

        preauthUtil.createPreauth(
            {
                byValue: requestOptions.username,
                key: requestOptions.secret,
                timestamp: requestOptions.timestamp
            },
            this._authSecret.bind(this, requestOptions, callback)
        );

    } else {

        this._authSecret(
            requestOptions,
            callback,
            null,
            requestOptions.secret
        );

    }

};

/**
 * Get a prebuilt request with an auth token.
 *
 * @param {GetRequestOptions} originalOptions options for
 * GetRequest
 * @param {callback} callback run with optional Error (see throws) and
 * Request-Object
 * @throws {SystemError}
 * @throws {InvalidOptionError}
 * @throws {NoTokenError}
 */

CommunicationApi.prototype.getRequest = function (originalOptions, callback) {

    // Check options

    var options;

    try {

        options =
            new communicationOptions.getRequest().validate(originalOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {

            callback(
                commonErrors.invalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {

            callback(
                commonErrors.systemError(
                    {
                        message: err.message
                    }
                )
            );

        }

        return;

    }

    if (!this.token && !options.noAuth) {

        callback(communicationErrors.noToken());
        return;

    }

    // Build request

    var requestOptions = {
        isBatch: options.isBatch,
        batchOnError: options.batchOnError,
        context: options.context
    };

    if (this.token) {

        requestOptions.context.authToken = {
            _content: this.token
        };

    }

    var request;

    try {

        request = new requestApi(requestOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {

            callback(
                commonErrors.invalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {

            callback(
                commonErrors.systemError(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        }

        return;

    }

    callback(null, request);

};

/**
 * Send a request to the Zimbra server and pass a response to the callback
 *
 * @param {RequestApi} request The request to send
 * @param {callback} callback callback run with optional error (see throws) and
 * Response
 * @throws {NoRequestsError}
 * @throws {ZimbraError}
 * @throws {SystemError}
 */

CommunicationApi.prototype.send = function (request, callback) {

    var that = this;

    request.getRequest(function (err, requestPojo) {

        if (err) {

            callback(err);
            return;

        }

        restler.postJson(that.options.url, requestPojo, {
                parser: restler.parsers.json
            })
            .on("complete", function (data) {

                if (data instanceof Error) {

                    // Shoud actually not happen here, but check that
                    // nonetheless.

                    callback(data);
                    return;

                }

                if (!data.hasOwnProperty("Body")) {

                    callback(commonErrors.systemError(
                        "Didn't understand non-faulty response:" +
                        " {{message}}",
                        {
                            message: util.inspect(data, false, null)
                        }));

                } else {

                    var response = null;

                    try {

                        response = new responseApi({
                            request: request, response: data.Body
                        });

                    } catch (err) {

                        callback(err);
                        return;

                    }

                    callback(null, response);

                }
            })
            .on("fail", function (data) {

                if (data.hasOwnProperty("Body") &&
                    data.Body.hasOwnProperty("Fault")) {

                    var code = "", reason = "", detail = "";

                    if (data.Body.Fault.hasOwnProperty("Code") &&
                        data.Body.Fault.Code.hasOwnProperty("Value")) {

                        code = data.Body.Fault.Code.Value;

                    }

                    if (data.Body.Fault.hasOwnProperty("Detail")) {

                        detail =
                            util.inspect(data.Body.Fault.Detail, false, null);

                    }

                    if (data.Body.Fault.hasOwnProperty("Reason") &&
                        data.Body.Fault.Reason.hasOwnProperty("Text")) {

                        reason = data.Body.Fault.Reason.Text;

                    }

                    callback(communicationErrors.zimbraError(undefined, {
                        code: code, detail: detail, reason: reason
                    }));

                } else {

                    callback(commonErrors.systemError(
                        "Didn't understand faulty response: {{message}}",
                        {
                            message: util.inspect(data, false, null)
                        }));

                }

            })
            .on("error", function (err) {
                callback(err);
            });

    });

};

module.exports = CommunicationApi;