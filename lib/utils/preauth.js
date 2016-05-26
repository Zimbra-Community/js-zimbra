var preauthOptions = require('../options/preauth'),
    commonErrors = require('../errors/common'),
    crypto = require('crypto-browserify'),
    sprintf = require('sprintf-js').sprintf;

/**
 * Preauthkey-calculation
 */

var LOG = console;

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

        LOG.log('preauth#createPreauth called');
        LOG.log('PreAuth: Validating options');

        try {

            options = new preauthOptions.CreatePreauth().validate(options);

        } catch (err) {

            if (err.name === 'InvalidOption') {

                LOG.error('Invalid options specified: %s', err.message);

                callback(
                    commonErrors.invalidOption(
                        undefined,
                        {
                            message: err.message
                        }
                    )
                );

            } else {

                LOG.error('System error: %s', err.message);

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

        LOG.log('Generating preauth key');

        var pakCreator = crypto.createHmac('sha1', options.key)
            .setEncoding('hex');

        pakCreator.write(
            sprintf(
                '%s|%s|%s|%s',
                options.byValue,
                options.by,
                options.expires,
                timestamp
            )
        );
        pakCreator.end();
        var pak = pakCreator.read();

        LOG.log('Returning preauth key %s', pak);

        callback(null, pak);

    }

};
