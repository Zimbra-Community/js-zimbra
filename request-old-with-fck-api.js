function (result) {

        if (result.clientError) {

            LOG.error('Received client error: %s', result.error);

            callback(result.error);
            return;

        }

        var data = result.body;

        if (result.serverError) {

            if (data.hasOwnProperty('Body') &&
                data.Body.hasOwnProperty('Fault')) {

                var code = '', reason = '', detail = '';

                if (data.Body.Fault.hasOwnProperty('Code') &&
                    data.Body.Fault.Code.hasOwnProperty('Value')) {

                    code = data.Body.Fault.Code.Value;

                }

                if (data.Body.Fault.hasOwnProperty('Detail')) {

                    detail =
                        util.inspect(data.Body.Fault.Detail,
                            false,
                            null);

                }

                if (data.Body.Fault.hasOwnProperty('Reason') &&
                    data.Body.Fault.Reason.hasOwnProperty('Text')) {

                    reason = data.Body.Fault.Reason.Text;

                }

                LOG.error(
                    'Received server error: %s',
                    JSON.stringify(data.Body.Fault)
                );

                callback(
                    communicationErrors.zimbraError(
                        undefined, {
                            code: code,
                            detail: detail,
                            reason: reason
                        }
                    )
                );

                return;

            }

        }

    if (!data.hasOwnProperty('Body')) {

        LOG.error('Invalid response returned from Zimbra' +
            ' server');

            callback(
                commonErrors.systemError(
                    "Didn't understand non-faulty response:" +
                    ' {{message}}',
                    {
                        message: util.inspect(data, false, null)
                    }
                )
            );

        } else {

            var response = null;

        LOG.debug('Building new Response object');

            try {

                response = new ResponseApi({
                    request: request, response: data.Body
                });

            } catch (err) {

                LOG.error('Received error: %s', err);

                callback(err);
                return;

            }

            callback(null, response);

        }

    }
);
