var BaseOption = require('./base').BaseOption;

/**
 */

/**
 * Option for creating a preauth
 *
 *  * byValue: value used with by. For example the username if by=name.
 *  * key: Preauth key
 *  * by: what is in byValue? For example: username (=name) [name]
 *  * expires: Milliseconds when the preauth expires. 0 means default
 *    expiration [0]
 *  * timestamp: Epoch-Timestamp in miliseconds when the preauth is valid. If
 *    left empty, will be calculated to current timestamp.
 *
 * @param {Object} options Options
 * @constructor
 */

function CreatePreauthOptions() {
    BaseOption.call(this);
}

CreatePreauthOptions.prototype = Object.create(BaseOption.prototype);
CreatePreauthOptions.prototype.constructor = CreatePreauthOptions;

CreatePreauthOptions.prototype.validationRules = {
    byValue: {
        presence: true
    },
    key: {
        presence: true
    }
};

CreatePreauthOptions.prototype.defaultOptions = {
    by: 'name',
    expires: 0,
    timestamp: null
};

module.exports = {
    CreatePreauth: CreatePreauthOptions
};
