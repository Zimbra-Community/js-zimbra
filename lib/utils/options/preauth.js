/**
 * Options definition for communication api
 */

var optionsApi = require('options-api');

/**
 * Option for creating a preauth
 *
 * {
 *  byValue: <value used with by. For example the username if by=name.>,
 *  key: <Preauth key>,
 *  by: <what is in byValue? For example: username (=name)> [name],
 *  expires: <Milliseconds when the preauth expires. 0 means default
 *   expiration> [0],
 *  timestamp: <Epoch-Timestamp in miliseconds when the preauth is valid. If
 *  left empty, will be calculated to current timestamp.>
 * }
 *
 * @param options Set options
 * @constructor
 */

function CreatePreauthOptions(options) {
    this.config(options);
}

optionsApi.attach(
    CreatePreauthOptions,
    {
        byValue: "",
        key: "",
        by: "name",
        expires: 0,
        timestamp: null
    },
    {
        byValue: /.+/,
        key: /.+/
    }
);


module.exports = {
    createPreauth: CreatePreauthOptions
};
