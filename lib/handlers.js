const pkg = require('../package.json');

module.exports = {
    contentJson: (req, res, next) => {
        res.header('Content-Type', 'application/json');
        next();
    },

    healthCheck: (req, res) => res.json({version: pkg.version})
};
