/**
 * Mocha Test suite
 */

var jszimbra = require('../lib/js-zimbra.js'),
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

        it("should authenticate without error", function(done) {

            var comm = new jszimbra.communication({
                url: config.config.test.url
            });

            comm.auth(
                config.config.test.auth,
                function (err) {

                    assert.strictEqual(err, null, "Got error");
                    assert.notStrictEqual(comm.token, "Token wasn't set.");
                    assert.strictEqual(comm.token, "MOCKTOKEN");
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