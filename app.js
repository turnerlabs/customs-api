const cors = require('cors'),
    debug = require('debug')('customs:app'),
    express = require('express'),
    morgan = require('morgan');

const pkg = require('./package.json'),
    handlers = require('./lib/handlers');

let port = process.env.PORT || 6754,
    app = express();

debug('%s v%s', pkg.name, pkg.version);

app.use(cors());
app.use(handlers.contentJson);

app.get('/_hc', handlers.healthCheck);

app.use(morgan('common'));

let server = app.listen(port, _ => debug('listening on %s', port));

module.exports = server;
