const debug = require('debug')('customs:auth'),
    request = require('./request'),
    helpers = require('./helpers'),
    shipit = process.env.SHIPIT_API || 'http://shipit.test.services.dmtio.net',
    authUser = process.env.SHIPIT_AUTH_USER || 'test-user',
    authToken = process.env.SHIPIT_AUTH_TOKEN || 'test-token';

module.exports = {
    checkToken: (req, res, next) => {
        let buildToken = req.headers['x-build-token'] || null,
            url = `${shipit}/v1/shipment/${req.params.shipment}/environment/${req.params.environment}`;

        debug('Build token: %s', buildToken);

        if (buildToken) {
            request.get(url, {
                'x-username': authUser,
                'x-token': authToken
            })
            .then(value => {
                debug('Request to ShipIt result: %s', value);
                // Compare user's buildToken to ShipIt's buildToken
                if (buildToken === value.buildToken) {
                    req.customsMessages.push('authenticated and authorized');
                    next();
                } else {
                    let err = `AuthFail: ${req.params.shipment}/${req.params.environment}/${req.params.provider} Payload: name: ${req.body.name}, ver: ${req.body.version}, img: ${req.body.image}, token: '${buildToken.slice(0, 4)}'`
                    console.error(err);
                    res.status(403);
                    res.json({message: 'Authentication failed'});
                }
            })
            .catch(reason => {
                let code = helpers.parseStatusCode(reason);

                debug('Request to ShipIt failed(%s): %s', reason);
                res.status(500);
                res.json({message: reason});
            });
        } else {
            let err = `NoAuth: ${req.params.shipment}/${req.params.environment}/${req.params.provider} Payload: name: ${req.body.name}, ver: ${req.body.version}, img: ${req.body.image}}`
            console.error(err);
            debug('Auth is failing with build token %s', buildToken);
            res.status(401);
            res.json({message: 'Authentication is required via a ShipIt build token'});
        }
    }
};
