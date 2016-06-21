# js-zimbra [![Build Status](https://travis-ci.org/Zimbra-Community/js-zimbra.svg?branch=master)](https://travis-ci.org/Zimbra-Community/js-zimbra) [![Code Climate](https://codeclimate.com/github/Zimbra-Community/js-zimbra/badges/gpa.svg)](https://codeclimate.com/github/Zimbra-Community/js-zimbra) [![Test Coverage](https://codeclimate.com/github/Zimbra-Community/js-zimbra/badges/coverage.svg)](https://codeclimate.com/github/Zimbra-Community/js-zimbra/coverage)
Javascript library to easily access Zimbra's SOAP API. Handles authentication
 using password auth or preauth keys, request sending, response interpreting 
 and batch processing.
 
This is basically a JS-port of the [Python-Zimbra library](https://github.com/Zimbra-Community/python-zimbra), 
but does a few things differently.

The main difference is, that only JSON-based requests are supported, no XML. 
The whole library is asynchronous and based on callbacks.

For details, please see the [official API documentation](http://zimbra-community.github.io/js-zimbra/).

## Getting Started
Install the module with: `npm install js-zimbra`

Afterwards you can use the library by requiring it:

    var jszimbra = require('js-zimbra');
    
## Authentication handling

To authenticate against a Zimbra server, use the "auth" method of the 
communication API like this:

```javascript
var jszimbra = require('js-zimbra');

// Initialize the communication object with the SOAP-API URL

var comm = new jszimbra.Communication({
    url: "https://your-zimbra-server/service/soap"
    });
    
// Authenticate
    
comm.auth({
    "username": "zimbrauser",
    "secret": "fowunfguipht542uip5nupfnru2ütu3ü2brtufwe"
}, function (err) {

    if (err) {
    
        // An error occured authenticating!
    
    }
    
    // Now, carry on creating requests and sending them
};
```

In this example, a Preauthkey was used. If you'd like to use a password 
instead, you can do this by setting the option "isPassword" in the options 
object passed to the auth-method to true:

```javascript
comm.auth({
    "username": "zimbrauser",
    "secret": "verysecretpassword",
    "isPassword": true
},(...)
```

If you're authenticating against the Zimbra Admin backend, you have to set 
the option "isAdmin" to true. Currently, Zimbra only supports password-based 
authentication for the administration backend, so the option "secret" has to be 
the password of an administrator. "isAdmin" implies "isPassword", 
so you don't have to set that as well.

## Request/Response handling

Like in the python version of this library, requests are built inside a 
"request handler". You can get one by using the "getRequest"-method of the 
communications api.

Afterwards, you can add one or multiple (see BatchRequest-handling) requests.
 Finally, supply the built-up request handler to the "send"-method of the 
 communications api and you'll retrieve a "response handler".
 
This handler has a "get"-method that returns the Zimbra response for your 
request as a plain javascript object.

Here's an example for the workflow:

```javascript
var jszimbra = require('js-zimbra');

// Initialize the communication object with the SOAP-API URL

var comm = new jszimbra.Communication({
    url: "https://your-zimbra-server/service/soap"
    });
    
// Authenticate
    
comm.auth({
    "username": "zimbrauser",
    "secret": "fowunfguipht542uip5nupfnru2ütu3ü2brtufwe"
}, function (err) {

    if (err) {
    
        // An error occured authenticating!
    
    }
    
    comm.getRequest({}, function (err, req) {
    
        if (err) {
        
            // Can't create a new request
        
        }
        
        req.addRequest({
            name: "GetAccountInfoRequest",
            namespace: "zimbraAccount",
            params: {
                "account": {
                    "by": "name",
                    "_content": "dennis.ploeger@getit.de"
                }
            }, function (err) {
            
            if (err) {
            
                // Can not add request to the request handler
            
            }
            
            comm.send(req, function (err, response) {
            
                if (err) {
                
                    // Can not send request
                
                }
                
                // response holds our response
                
                console.log(response.get().GetAccountInfoResponse);
            
            });
            
        });
    
    });

});
```

## Batch Requests

js-zimbra also supports batch requests. This has to be enabled in the 
getRequest-method by setting the option "isBatch" to true. Afterwards, 
subsequent calls to request#addRequest will add requests to this batch and 
return the request id to the callback.
 
```javascript
var comm = new jszimbra.Communication({
    url: "https://your-zimbra-server/service/soap"
});

comm.auth({
    "username": "zimbrauser",
    "secret": "fowunfguipht542uip5nupfnru2ütu3ü2brtufwe"
}}, function (err) {

        comm.getRequest({
            isBatch: true
        }, function (err, req) {

            req.addRequest({
                name: "GetAccountInfoRequest",
                namespace: "zimbraAccount",
                params: {
                    "account": {
                        "by": "name",
                        "_content": "zimbraid"
                    }
                }
            }, function (err, reqid) {
            
                // reqid holds the id of the added request and can be used to
                // identify the request in the response

                req.addRequest({
                    name: "GetAccountInfoRequest",
                    namespace: "zimbraAccount",
                    params: {
                        "account": {
                            "by": "name",
                            "_content": "zimbraid"
                        }
                    }
                }, function (err, reqid) {

                    comm.send(req, function (err, response) {
                    
                        // Shows an array with two members

                        console.log(response.GetAccountInfoRequest);                        

                    });

                });

            });

        });

        done();

    }
);
```

## Logging

js-zimbra uses the excellent [Winston](https://github.com/winstonjs/winston) 
framework for logging. To make it easier to configure js-zimbra-specific 
logging, we use our own logger called "js-zimbra".

You can configure the logger by issuing something like the following commands
 *before* requiring the js-zimbra library:
 
```javascript
// Set js-zimbra's maximum log level to "error" to mostly silence it.

var winston = require('winston');

winston.loggers.add("js-zimbra", {console: {level: "error"}});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. 
Add unit tests for any new or changed functionality. Lint and test your code 
using

    grunt

You may also (and are suggested to) check the code coverage of your new or 
changed code by running

    grunt coverage

## License
Copyright (c) 2015 Dennis Ploeger  
Licensed under the MIT license.
