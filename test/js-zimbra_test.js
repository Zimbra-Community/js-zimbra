'use strict';

var js_zimbra = require('../lib/js-zimbra.js'),
    jsonfile = require('jsonfile');


/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

module.exports = {
    setUp: function (done) {
        this.config = jsonfile.readFileSync("package.json");

        done();
    },
    testAuth: function (test) {

        var comm = new js_zimbra.communication({
            url: this.config.config.test.url
        });

        comm.auth(
            this.config.config.test.auth,
            function (err, result) {



            }
        );

        test.done();

    }
};
