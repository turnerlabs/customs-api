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
                req.customsMessages.push(`triggered shipment ${req.params.shipment}:${req.params.environment} on barge ${req.params.provider}`);
                next();
            })
            .catch(reason => {
                let code = helpers.parseStatusCode(reason);
                debug('Request to Triggers failed(%s): %s', code, reason);
                res.status(code);
                res.json({message: reason});
            });
    }
};