// // Creates user-defined exceptions
// // (Constructor Pattern)
// var CustomError = (function() {
//     'use strict';
//
//     function CustomError(message) {
//         //enforces new (prevent 'this' be the global scope)
//         if (!(this instanceof CustomError)) {
//             return new CustomError(message);
//         }
//
//         var i, error, len;
//
//         //builds the message with multiple arguments
//         message = message || "An exception occurred";
//         for (i = 1, len = arguments.length; i < len; i += 1) {
//             message = message.replace(new RegExp("\\{" + (i - 1) + "}"), arguments[i]);
//         }
//         //store the exception stack
//         error = new Error(message);
//
//         //access to CustomError.prototype.name
//         error.name = this.name;
//
//         //set the properties of the instance
//         //in order to reflect an Error object
//         Object.defineProperties(this, {
//             "stack": {
//                 enumerable: false,
//                 //retrieves the stack trace
//                 get: function() { return error.stack; }
//             },
//             "message": {
//                 enumerable: false,
//                 value: message
//             }
//         });
//     }
//
//     // Creates the prototype and prevents the direct reference to Error.prototype;
//     CustomError.prototype = Object.create(Error.prototype);
//     // Not used new Error() here because the exception would be generated now,
//     // and we need set the exception when the new instance is created.
//
//     Object.defineProperties(CustomError.prototype, {
//         //fixes the constructor (ES5)
//         "constructor": {
//             configurable: false,
//             enumerable: false,
//             writable: false,
//             value: CustomError
//         },
//         "name": {
//             configurable: false,
//             enumerable: false,
//             writable: false,
//             value: "JSU Error"
//         }
//     });
//
//     //returns the constructor
//     return CustomError;
// }());

window.errorFactory = define(function () {
    return function errorFactory(msg) {
        console.log(msg);
    };
});
