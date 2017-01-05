const pkg = require('../package.json');

module.exports = {
    appContext: (req, res, next) => {
        req.customsMessages = [];
        next();
    },

    checkParams: (req, res, next) => {
        let fields = ['name', 'image', 'version'],
            values = Object.keys(req.body),
            results = [],
            passed = 0;

        fields.forEach(field => {
            if (values.includes(field)) {
                passed++;
            }
            else {
                let error = `missing field: '${field}'`;
                results.push(error);
                console.log(error);
            }
        });

        if (passed == fields.length) {
            next();
        } else {
            res.status(400);
            res.json({code: 400, message: results.join(', ')});
        }
    },

    contentJson: (req, res, next) => {
        res.header('Content-Type', 'application/json');
        next();
    },

    healthCheck: (req, res) => res.json({code: 200, version: pkg.version}),

    response: (req, res) => res.json({code: 200, message: req.customsMessages.join(', ')})
};
