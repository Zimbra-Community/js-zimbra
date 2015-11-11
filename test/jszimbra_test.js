/**
 * Mocha Test suite
 */

var requireHelper = require('./require_helper'),
    jszimbra = requireHelper('jszimbra.js'),
    jsonfile = require('jsonfile'),
    assert = require('assert'),
    apimocker = require('apimocker');

// Ignore mocha globals
/*global after, before, describe, it*/

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

                    assert.strictEqual(err, null, "Got error");
                    assert.notStrictEqual(comm.token, "Token wasn't set.");

                    if (config.config.test.useMock) {

                        // Within the mock environment, we have access to
                        // what the token will be

                        assert.strictEqual(comm.token, "MOCKTOKEN");

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

                    assert.strictEqual(err, null, "Got error");
                    assert.notStrictEqual(comm.token, "Token wasn't set.");

                    if (config.config.test.useMock) {

                        // Within the mock environment, we have access to
                        // what the token will be

                        assert.strictEqual(comm.token, "MOCKTOKEN");

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

                    assert.strictEqual(err, null, "Got error");
                    assert.notStrictEqual(comm.token, "Token wasn't set.");

                    if (config.config.test.useMock) {

                        // Within the mock environment, we have access to
                        // what the token will be

                        assert.strictEqual(comm.token, "MOCKTOKEN");

                    }

                    done();

                }
            );

        });

    });

    after(function() {

        if (config.config.test.useMock) {

            // Stop Apimocker-Server

            server.stop();

        }

    });

});