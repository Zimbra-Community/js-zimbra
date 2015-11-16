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
     * @param {callback} callback run with optional error (see throws) and
     * preauth key
     * @throws {InvalidOptionError}
     * @throws {SystemError}
     */

    createPreauth: function(options, callback) {

        try {

            options = new preauthOptions.createPreauth().validate(options);

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

        // Create the preauth

        var pakCreator = crypto.createHmac("sha1", options.key)
            .setEncoding("hex");

        pakCreator.write(
            util.format(
                "%s|%s|%s|%s",
                options.byValue,
                options.by,
                options.expires,
                timestamp
            )
        );
        pakCreator.end();
        var pak = pakCreator.read();

        callback(null, pak);

    }

};