const debug = require('debug')('customs:shipit'),
    request = require('./request'),
    helpers = require('./helpers'),
    shipit = process.env.SHIPIT_API || 'http://shipit.test.services.dmtio.net';

module.exports = {
    update: (req, res, next) => {
        let url = `${shipit}/v1/shipment/${req.params.shipment}/environment/${req.params.environment}/container/${req.body.name}`,
            payload = {
                buildToken: req.headers['x-build-token'],
                image: req.body.image
            };

        request.put(url, null, payload)
            .then(value => {
                debug('Request to ShipIt container %j', value);
                req.customsMessages.push(`updated shipment ${req.params.shipment}:${req.params.environment} container ${req.body.name}`);
                next();
            })
            .catch(reason => {
                let code = helpers.parseStatusCode(reason);
                console.error('Request to ShipIt containers failed(%s): %s', code, reason.message || reason);
                res.status(code);
                res.json({message: reason.message || reason});
            });
    }
};
