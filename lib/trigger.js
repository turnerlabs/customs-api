const debug = require('debug')('customs:trigger'),
    request = require('./request'),
    helpers = require('./helpers'),
    trigger = process.env.TRIGGER_API || 'http://harbor-trigger.test.services.dmtio.net';

module.exports = {
    execute: (req, res, next) => {
        let url = `${trigger}/${req.params.shipment}/${req.params.environment}/${req.params.provider}`;

        request.post(url, null, {})
            .then(value => {
                debug('Request to Trigger %j', value);
                req.customsMessages.push(`triggered shipment ${req.params.shipment}:${req.params.environment} with provider ${req.params.provider}`);
                next();
            })
            .catch(reason => {
                let code = helpers.parseStatusCode(reason);
                console.error('Request to Triggers failed(%s): %s', code, reason.message || reason);
                res.status(code);
                res.json({code, message: reason.message || reason});
            });
    }
};
