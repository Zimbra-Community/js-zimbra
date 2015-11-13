var baseOption = require('./index').baseOption;

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

function RequestConstructorOptions() {
    baseOption.call(this);
}

RequestConstructorOptions.prototype = Object.create(baseOption.prototype);
RequestConstructorOptions.prototype.constructor = RequestConstructorOptions;

RequestConstructorOptions.prototype.validationRules = {
    batchOnError: {
        format: /stop|continue/
    }
};

RequestConstructorOptions.prototype.defaultOptions = {
    token: "",
    isBatch: false,
    batchOnError: "stop",
    context: {}
};

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

function AddRequestOptions() {
    baseOption.call(this);
}

AddRequestOptions.prototype = Object.create(baseOption.prototype);
AddRequestOptions.prototype.constructor = AddRequestOptions;

AddRequestOptions.prototype.validationRules = {
    name: {
        presence: true
    }
};

AddRequestOptions.prototype.defaultOptions = {
    params: {},
    namespace: "zimbraMail"
};

module.exports = {
    constructor: RequestConstructorOptions,
    addRequest: AddRequestOptions
};
