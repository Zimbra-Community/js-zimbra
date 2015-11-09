/**
 * Options definition for request api
 */

var optionsApi = require('options-api');

/**
 * Option checking for constructor
 *
 * {
 *  token: <Authentication token>
 *  isBatch: <Will this be a batch request?> [false]
 *  batchOnError: <On Error mode for batch request> [stop],
 *  context: <Context parameters (see Zimbra's soap.txt)>
 * }
 *
 * batchOnError can be either stop (stop on the first batch error) or
 * continue (continue batch, even if there are errors)
 *
 * @param options Set options
 * @constructor
 */

function ConstructorOptions(options) {
    this.config(options);
}

optionsApi.attach(
    ConstructorOptions,
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
 * {
 *  name: <Name of Request>,
 *  params: <Request-parameters>,
 *  namespace: <Request-Namespace> [zimbraMail]
 * }
 *
 * @param options
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
    constructor: ConstructorOptions,
    addRequest: AddRequestOptions
};
