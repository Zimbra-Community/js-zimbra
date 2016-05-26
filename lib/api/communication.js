var communicationOptions = require('../options/communication'),
    communicationErrors = require('../errors/communication'),
    commonErrors = require('../errors/common'),
    RequestApi = require('./request'),
    ResponseApi = require('./response'),
    preauthUtil = require('../utils/preauth'),
    merge = require('merge');
    superagent = require('superagent');

/**
 * Communications handling
 */

var LOG = console;

/**
 * Communications-Handling API
 *
 * @param {CommunicationConstructorOptions} constructorOptions
 * Options for constructor
 * @constructor
 * @throws {InvalidOptionError}
 */

function CommunicationApi(constructorOptions) {
    this.debug = constructorOptions && constructorOptions.debug;
    delete constructorOptions['debug'];
    if (this.debug) {
        LOG.log('Instantiating communication API');
        LOG.log('Validating constructor options');
    }

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

        if (this.debug) {
            LOG.log('Setting predefined token');
        }
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

        if (this.debug) {
            LOG.log('CommunicationApi#_handleAuthResponse called');
        }

        if (err) {

            if (this.debug) {
                LOG.error('Error occured: %s', err);
            }
            callback(err);
            return;

        }

        if (!response.get().hasOwnProperty('AuthResponse')) {

            if (this.debug) {
                LOG.error(
                    "Didn't find AuthResponse in response: %s",
                    JSON.stringify(response)
                );
            }

            callback(commonErrors.systemError(
                "Didn't find AuthResponse in response: {{message}} ",
                {
                    message: JSON.stringify(response)
                }));
            return;

        }

        // Set the auth token
        if (this.debug) {
          LOG.log('AuthResponse');
          LOG.log(response.get());
        }

        this.token = response.get().AuthResponse.authToken[0]._content;

        if (this.debug) {
            LOG.info('Retrieved auth token %s', this.token);
        }
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

        if (this.debug) {
            LOG.log('CommunicationApi#_authSecret called');
        }
        var that = this;

        if (err) {
            if (this.debug) {
                LOG.error('Retrieved error: %s', err);
            }
            callback(err);
            return;

        }
        if (this.debug) {
            LOG.log('Building up a new request.');
        }
        this.getRequest({
            noAuth: true
        }, function (err, request) {

            if (err) {
                if (this.debug) {
                    LOG.error('Retrieved error: %s', err);
                }
                callback(err);
                return;

            }
            if (this.debug) {
                LOG.log('Building parameters for new AuthRequest');
            }
            var requestParams = {
                account: {
                    by: 'name', _content: options.username
                }
            };

            var ns = 'zimbraAccount';

            if (options.isAdmin) {
                if (this.debug) {
                    LOG.log('Enabling Admin authentication. Assuming password' +
                        ' authentication');
                }
                ns = 'zimbraAdmin';
                requestParams.password = secret;

            } else if (options.isPassword) {
                if (this.debug) {
                    LOG.log('Enabling password authentication');
                }
                requestParams.password = {
                    _content: secret
                };

            } else {
                if (this.debug) {
                    LOG.log('Enabling preauth authentication');
                }
                requestParams.preauth = {
                    timestamp: options.timestamp, expires: 0, _content: secret
                };

            }
            if (this.debug) {
                LOG.log('Adding AuthRequest to Request stack');
            }
            request.addRequest({
                name: 'AuthRequest', params: requestParams, namespace: ns
            }, function (err) {

                if (err) {
                    if (this.debug) {
                        LOG.error('Received error: %s', err);
                    }
                    callback(err);
                    return;

                }
                if (this.debug) {
                    LOG.log('Sending AuthRequest');
                }
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
    if (this.debug) {
        LOG.log('CommunicationApi#auth called');

        LOG.log('auth: Validating options');
    }
    try {

        options = new communicationOptions.Auth().validate(originalOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {
            if (this.debug) {
                LOG.error('Invalid options specified: %s', err.message);
            }
            callback(
                commonErrors.invalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {
            if (this.debug) {
                LOG.error('System error: %s', err.message);
            }
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
    if (this.debug) {
        LOG.log('Handling options');
    }
    var isPassword = options.isPassword;

    if (options.isAdmin) {
        if (this.debug) {
            LOG.log('Admin auth enabled, assuming password auth');
        }
        isPassword = true;

    }

    // Clone options into request options

    var requestOptions = merge({}, options);

    requestOptions.isPassword = isPassword;
    requestOptions.timestamp = new Date().getTime();

    if (!isPassword) {
        if (this.debug) {
            LOG.log('Preauth needed. Generate one');
        }
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
    if (this.debug) {
        LOG.log('CommunicationApi#getRequest called');
        LOG.log('getRequest: Validating options');
    }
    try {

        options =
            new communicationOptions.GetRequest().validate(originalOptions);

    } catch (err) {

        if (err.name === 'InvalidOption') {
            if (this.debug) {
                LOG.error('Invalid options specified: %s', err.message);
            }
            callback(
                commonErrors.invalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {
            if (this.debug) {
                LOG.error('System error: %s', err.message);
            }
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
        if (this.debug) {
            LOG.error('No token specified and no authentication wanted.');
        }
        callback(communicationErrors.noToken());
        return;

    }
    if (this.debug) {
        LOG.log('Building request object');
    }
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

        request = new RequestApi(requestOptions, this.debug);

    } catch (err) {

        if (err.name === 'InvalidOption') {
            if (this.debug) {
                LOG.error(
                    'Invalid options specified for Request object: %s',
                    err.message
                );
            }
            callback(
                commonErrors.invalidOption(
                    undefined,
                    {
                        message: err.message
                    }
                )
            );

        } else {
            if (this.debug) {
                LOG.error('System error creating request object: %s', err.message);
            }
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
    if (that.debug) {
        LOG.log('CommunicationApi#send called');
        LOG.log('Fetching request pojo from request stack');
    }
    request.getRequest(function (err, requestPojo) {

        if (err) {
            if (that.debug) {
                LOG.error('Received error: %s', err);
            }
            callback(err);
            return;

        }
        if (that.debug) {
            LOG.log('Zimbra URL: %s', that.options.url);
            LOG.log('Sending request to Zimbra: %s', JSON.stringify(requestPojo));
        }

        superagent.post(that.options.url)
          .set('Content-Type', 'application/json; charset=utf-8')
          .timeout(that.options.timeout)
          .send(JSON.stringify(requestPojo))
          .end(function(err, data){
            if (err) {
              var error_result = JSON.parse(data.text);
              return callback(error_result.Body);
            }
            var response = null;
            var result = JSON.parse(data.text);
            if (that.debug) LOG.log('Building new Response object');
            try {
              var resp_obj = { request: request, response: result.Body, debug: that.debug };
              response = new ResponseApi(resp_obj);
            } catch (err) {
              if (that.debug) LOG.error('Received error: %s', err);
              return callback(err);
            }
            return callback(null, response);
          });
    });

};

module.exports = CommunicationApi;
