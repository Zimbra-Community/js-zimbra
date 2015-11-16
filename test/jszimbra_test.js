/**
 * Mocha Test suite
 */

var requireHelper = require('./require_helper'),
    jszimbra = requireHelper('jszimbra.js'),
    jsonfile = require('jsonfile'),
    should = require('should'),
    apimocker = require('apimocker');

// Ignore mocha globals
/*global before, describe, it*/

var config = jsonfile.readFileSync("package.json");
var server = null;

if (config.config.test.useMock) {

    // Configure apimocker server

    server = apimocker.createServer({
        port: config.config.test.mockPort
    });
    server.setConfigFile("apimocker.json");
}

describe("js-zimbra's", function () {

    before(function() {

        if (config.config.test.useMock) {

            // Start apimocker server

            server.start();

        }

    });

    describe("communication API", function() {

        it("should authenticate with a password without error", function(done) {

            var comm = new jszimbra.communication({
                url: config.config.test.url
            });

            comm.auth(
                config.config.test.passwordAuth,
                function (err) {

                    should(err).be.null("Got error");
                    comm.token.should.not.be.null("Token wasn't set.");

                    if (config.config.test.useMock) {

                        // Within the mock environment, we have access to
                        // what the token will be

                        comm.token.should.be.equal(
                            "MOCKTOKEN",
                            "Token has not the right content"
                        );

                    }

                    done();

                }
            );

        });

        it("should authenticate with a preauthkey without error", function(done) {

            var comm = new jszimbra.communication({
                url: config.config.test.url
            });

            comm.auth(
                config.config.test.preauthkeyAuth,
                function (err) {

                    should(err).be.null("Got error");
                    comm.token.should.not.be.null("Token wasn't set.");

                    if (config.config.test.useMock) {

                        // Within the mock environment, we have access to
                        // what the token will be

                        comm.token.should.be.equal(
                            "MOCKTOKEN",
                            "Token has not the right content"
                        );
                    }

                    done();

                }
            );

        });

        it("should authenticate to admin-api without error", function(done) {

            var comm = new jszimbra.communication({
                url: config.config.test.adminUrl
            });

            comm.auth(
                config.config.test.adminAuth,
                function (err) {

                    should(err).be.null("Got error");
                    comm.token.should.not.be.null("Token wasn't set.");

                    if (config.config.test.useMock) {

                        // Within the mock environment, we have access to
                        // what the token will be

                        comm.token.should.be.equal(
                            "MOCKTOKEN",
                            "Token has not the right content"
                        );
                    }

                    done();

                }
            );

        });

    });

    describe("request API", function () {

        it("should correctly handle batch requests", function (done) {

            var comm = new jszimbra.communication({
                url: config.config.test.url
            });

            comm.auth(
                config.config.test.preauthkeyAuth,
                function (err) {

                    should(err).be.null("Got error");

                    comm.getRequest({
                        isBatch: true
                    }, function (err, req) {

                        should(err).be.null("Got error");

                        req.should.not.be.null("Request wasn't generated.");

                        req.addRequest({
                            name: "GetAccountInfoRequest",
                            namespace: "zimbraAccount",
                            params: {
                                "account": {
                                    "by": "name",
                                    "_content": "zimbraid"
                                }
                            }
                        }, function (err) {

                            should(err).be.null("Got error");

                            req.addRequest({
                                name: "GetAccountInfoRequest",
                                namespace: "zimbraAccount",
                                params: {
                                    "account": {
                                        "by": "name",
                                        "_content": "zimbraid"
                                    }
                                }
                            }, function (err) {

                                should(err).be.null("Got error");

                                comm.send(req, function (err, response) {

                                    should(err).be.null("Got error");

                                    response.isBatch.should.be(
                                        true,
                                        "Response wasn't a BatchResponse"
                                    );

                                    response.get(1).should.have.property(
                                        "GetAccountInfoResponse"
                                    );

                                });

                            });

                        });

                    });

                    done();

                }
            );

        });

    });

});