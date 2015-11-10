'use strict';

var jszimbra = require('../lib/js-zimbra.js'),
    jsonfile = require('jsonfile'),
    assert = require('assert'),
    describe = require('mocha').describe,
    it = require('mocha').it;

var config = jsonfile.readFileSync("package.json");

describe("js-zimbra's", function () {

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

});