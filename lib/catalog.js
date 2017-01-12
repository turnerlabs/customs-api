const debug = require('debug')('customs:catalog'),
    request = require('./request'),
    helpers = require('./helpers'),
    catalogit = process.env.CATALOGIT_API || 'http://catalogit.test.services.dmtio.net';

module.exports = {
    register: (req, res, next) => {
        if (req.body.catalog || req.path.split('/')[1] === 'catalog') {
            debug('POST: Catalog %s %s', req.params.shipment, req.params.environment, req.body.name, req.body.version);
            let url = `${catalogit}/v1/containers`;

            request.post(url, null, req.body)
                .then(value => {
                    debug('Request to CatalogIt %j', value);
                    req.customsMessages.push(`cataloged ${req.body.name} v${req.body.version}`);
                    next();
                })
                .catch(reason => {
                    let code = helpers.parseStatusCode(reason);
                    console.error('Request to CatalogIt failed(%s): %s', code, reason.message || reason);
                    res.status(code);
                    res.json({code, message: reason.message || reason});
                });
        } else {
            next();
        }
    },
    check: checkImage
};

/**
  checkImage
  checks to see if an image exists in the catalog. Only returns string values as to whether or not it does exist.
**/
function checkImage(req, res, next) {
    if (req.body.catalog || req.path.split('/')[1] === 'catalog') {
        debug('Get: Catalog %s %s', req.params.image, req.params.version);
        let url = `${catalogit}/v1/container/${req.params.image}/${req.params.version}`;
        
        request.get(url, null)
            .then(value => {
                debug('Request to CatalogIt %j', value);
                req.customsMessages.push(`Image Exists In Catalog: ${req.params.image} v${req.params.version}`);
                next();
            })
            .catch(reason => {
                let code = helpers.parseStatusCode(reason);
                console.error('Request to CatalogIt failed(%s): %s', code, reason.message || reason);
                res.status(code);
                res.json({code, message: reason.message || reason});
            });
    } else {
        next();
    }
}
