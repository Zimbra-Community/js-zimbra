var optionsApi = require('options-api');

/**
 * Option checking for constructor
 *
 *  * token: Authentication token
 *  * isBatch: Will this be a batch request? [false]
 *  * batchOnError: On Error mode for batch request [stop]
 *  * context: Context parameters (see Zimbra's soap.txt)
 *
 * batchOnError can be either stop (stop on the first batch error) or
 * continue (continue batch, even if there are errors)
 *
 * @param {Object} options Options
 * @memberof options
 * @constructor
 */

function RequestConstructorOptions(options) {
    this.config(options);
}

optionsApi.attach(
    RequestConstructorOptions,
    {
        token: "",
        isBatch: false,
        batchOnError: "stop",
        context: {}
    },
    {
        batchOnError: /stop|continue/
    }
);

/**
 * Options for addRequest
 *
 *  * name: Name of Request
 *  * params: Request-parameters
 *  * namespace: Request-Namespace [zimbraMail]
 *
 * @param {Object} options Options
 * @memberof options
 * @constructor
 */

function AddRequestOptions(options) {
    this.config(options);
}

optionsApi.attach(
    AddRequestOptions,
    {
        name: "",
        params: {},
        namespace: "zimbraMail"
    },
    {
        name: /.+/
    }
);

module.exports = {
    constructor: RequestConstructorOptions,
    addRequest: AddRequestOptions
};
