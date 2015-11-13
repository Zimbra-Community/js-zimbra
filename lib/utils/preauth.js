var preauthOptions = require('../options/preauth'),
    commonErrors = require('../errors/common'),
    crypto = require('crypto'),
    util = require('util');

/**
 * Preauthkey-calculation
 */

module.exports = {

    /**
     * Create a preauth value
     *
     * @param {CreatePreauthOptions} options options for createPreauth
     * @param {callback} callback run with optional error and preauth key
     * @memberof utils
     */

    createPreauth: function(options, callback) {

        try {

            options = preauthOptions.createPreauth().validate(options);

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

        var timestamp = options.timestamp;

        if (!timestamp) {

            timestamp = new Date().getTime();

        }

        var pak = crypto.createHmac("sha1", options.key)
            .setEncoding("hex")
            .write(
                util.format(
                    "%s|%s|%s|%s",
                    options.byValue,
                    options.by,
                    options.expires,
                    timestamp
                )
            )
            .end()
            .read();

        callback(null, pak);

    }

};