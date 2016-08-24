var communicationOptions = require('../options/communication'),
    communicationErrors = require('../errors/communication'),
    commonErrors = require('../errors/common'),
    RequestApi = require('./request'),
    ResponseApi = require('./response'),
    preauthUtil = require('../utils/preauth'),
    util = require('util'),
    merge = require('merge'),
    unirest = require('unirest'),
    winston = require('winston');

/**
 * Communications handling
 */

var LOG = winston.loggers.get('js-zimbra');

/**
 * Communications-Handling API
 *
 * @param {CommunicationConstructorOptions} constructorOptions
 * Options for constructor
 * @constructor
 * @throws {InvalidOptionError}
 */

function CommunicationApi(constructorOptions) {

    LOG.debug('Instantiating communication API');
    LOG.debug('Validating constructor options');

    // Sanitize option eventually throwing an InvalidOption

    try {

        this.options =
            new communicationOptions.Constructor().validate(constructorOptions);

    } catch (err) {

        throw(
            err
        );

    }

    if (this.options.token !== '') {

        LOG.debug('Setting predefined token');

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

        LOG.debug('CommunicationApi#_handleAuthResponse called');

        if (err) {

            LOG.error('Error occured: %s', err);

            callback(err);
            return;

        }

        if (!response.get().hasOwnProperty('AuthResponse')) {

            LOG.error(
                "Didn't find AuthResponse in response: %s",
                util.inspect(response, false, null)
            );

            callback(commonErrors.SystemError(
                "Didn't find AuthResponse in response: {{message}} ",
                {
                    message: util.inspect(response, false, null)
                }));
            return;

        }

        // Set the auth token

        this.token = response.get().AuthResponse.authToken[0]._content;

        LOG.info('Retrieved auth token %s', this.token);

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

        LOG.debug('CommunicationApi#_authSecret called');

        var that = this;

        if (err) {

            LOG.error('Retrieved error: %s', err);

            callback(err);
            return;

        }

        LOG.debug('Building up a new request.');

        this.getRequest({
            noAuth: true
        }, function (err, request) {

            if (err) {

                LOG.error('Retrieved error: %s', err);

                callback(err);
                return;

            }

            LOG.debug('Building parameters for new AuthRequest');

            var requestParams = {
                account: {
                    by: 'name', _content: options.username
                }
            };

            var ns = 'zimbraAccount';

            if (options.isAdmin) {

                LOG.debug('Enabling Admin authentication. Assuming password' +
                    ' authentication');

                ns = 'zimbraAdmin';
                requestParams.password = secret;

            } else if (options.isPassword) {

                LOG.debug('Enabling password authentication');

                requestParams.password = {
                    _content: secret
                };

            } else {

                LOG.debug('Enabling preauth authentication');

                requestParams.preauth = {
                    timestamp: options.timestamp, expires: 0, _content: secret
                };

            }

            LOG.debug('Adding AuthRequest to Request stack');

            request.addRequest({
                name: 'AuthRequest', params: requestParams, namespace: ns
            }, function (err) {

                if (err) {

                    LOG.error('Received error: %s', err);

                    callback(err);
                    return;

                }

                LOG.debug('Sending AuthRequest');

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

    LOG.debug('CommunicationApi#auth called');

    LOG.debug('Validating options');

    try {

        options = new communicationOptions.Auth().validate(originalOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {

            LOG.error('Invalid options specified: %s', err.message);

            callback(
                commonErrors.InvalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {

            LOG.error('System error: %s', err.message);

            callback(
                commonErrors.SystemError(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        }

        return;

    }

    LOG.debug('Handling options');

    var isPassword = options.isPassword;

    if (options.isAdmin) {

        LOG.debug('Admin auth enabled, assuming password auth');

        isPassword = true;

    }

    // Clone options into request options

    var requestOptions = merge({}, options);

    requestOptions.isPassword = isPassword;
    requestOptions.timestamp = new Date().getTime();

    if (!isPassword) {

        LOG.debug('Preauth needed. Generate one');

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

    var options;

    LOG.debug('CommunicationApi#getRequest called');
    LOG.debug('Validating options');

    try {

        options =
            new communicationOptions.GetRequest().validate(originalOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {

            LOG.error('Invalid options specified: %s', err.message);

            callback(
                commonErrors.InvalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {

            LOG.error('System error: %s', err.message);

            callback(
                commonErrors.SystemError(
                    {
                        message: err.message
                    }
                )
            );

        }

        return;

    }

    if (!this.token && !options.noAuth) {

        LOG.error('No token specified and no authentication wanted.');

        callback(communicationErrors.NoToken());
        return;

    }

    LOG.debug('Building request object');

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

        request = new RequestApi(requestOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {

            LOG.error(
                'Invalid options specified for Request object: %s',
                err.message
            );

            callback(
                commonErrors.InvalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {

            LOG.error('System error creating request object: %s', err.message);

            callback(
                commonErrors.SystemError(
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

    LOG.debug('CommunicationApi#send called');
    LOG.debug('Fetching request pojo from request stack');

    request.getRequest(function (err, requestPojo) {

        if (err) {

            LOG.error('Received error: %s', err);

            callback(err);
            return;

        }

        LOG.debug('Sending request to Zimbra: %s', JSON.stringify(requestPojo));

        unirest.post(that.options.url)
            .type('json')
            .send(requestPojo)
            .end(function (result) {

                    if (result.clientError) {

                        LOG.error('Received client error: %s', result.error);

                        callback(result.error);
                        return;

                    }

                    var data = result.body;

                    if (result.serverError) {

                        if (data.hasOwnProperty('Body') &&
                            data.Body.hasOwnProperty('Fault')) {

                            var code = '', reason = '', detail = '';

                            if (data.Body.Fault.hasOwnProperty('Code') &&
                                data.Body.Fault.Code.hasOwnProperty('Value')) {

                                code = data.Body.Fault.Code.Value;

                            }

                            if (data.Body.Fault.hasOwnProperty('Detail')) {

                                detail =
                                    util.inspect(data.Body.Fault.Detail,
                                        false,
                                        null);

                            }

                            if (data.Body.Fault.hasOwnProperty('Reason') &&
                                data.Body.Fault.Reason.hasOwnProperty('Text')) {

                                reason = data.Body.Fault.Reason.Text;

                            }

                            LOG.error(
                                'Received server error: %s',
                                JSON.stringify(data.Body.Fault)
                            );

                            callback(
                                communicationErrors.ZimbraError(
                                    undefined, {
                                        code: code,
                                        detail: detail,
                                        reason: reason
                                    }
                                )
                            );

                            return;

                        }

                    }

                if (!data.hasOwnProperty('Body')) {

                    LOG.error('Invalid response returned from Zimbra' +
                        ' server');

                        callback(
                            commonErrors.SystemError(
                                "Didn't understand non-faulty response:" +
                                ' {{message}}',
                                {
                                    message: util.inspect(data, false, null)
                                }
                            )
                        );

                    } else {

                        var response = null;

                    LOG.debug('Building new Response object');

                        try {

                            response = new ResponseApi({
                                request: request, response: data.Body
                            });

                        } catch (err) {

                            LOG.error('Received error: %s', err);

                            callback(err);
                            return;

                        }

                        callback(null, response);

                    }

                }
            );

    });

};

module.exports = CommunicationApi;
