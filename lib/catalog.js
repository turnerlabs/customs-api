const debug = require('debug')('customs:catalog'),
    request = require('./request'),
    helpers = require('./helpers'),
    catalogit = process.env.CATALOGIT_API || 'http://catalogit.test.services.dmtio.net';

module.exports = {
    register: (req, res, next) => {
        if (req.body.catalog) {
            debug('Catalog %s %s', req.params.shipment, req.params.environment);
            let url = `${catalogit}/v1/containers`;

            request.post(url, null, req.body)
                .then(value => {
                    debug('Request to CatalogIt %j', value);
                    req.customsMessages.push(`cataloged ${req.body.name} v${req.body.version}`);
                    next();
                })
                .catch(reason => {
                    let code = helpers.parseStatusCode(reason);
                    debug('Request to CatalogIt failed(%s): %s', code, reason);
                    res.status(code);
                    res.json({message: reason});
                });
        } else {
            next();
        }
    }
};