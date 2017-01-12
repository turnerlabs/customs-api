const cors = require('cors'),
    debug = require('debug')('customs:app'),
    express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan');

const pkg = require('./package.json'),
    auth = require('./lib/auth'),
    catalog = require('./lib/catalog'),
    handlers = require('./lib/handlers'),
    shipit = require('./lib/shipit'),
    trigger = require('./lib/trigger');

let port = process.env.PORT || 6754,
    app = express();

debug('%s v%s', pkg.name, pkg.version);

app.set('x-powered-by', false);
app.set('etag', false);

app.use(cors());
app.use(bodyParser.json())
app.use(handlers.contentJson);

app.get('/_hc', handlers.healthCheck);

app.use(morgan('common'));
app.use(handlers.appContext);

app.post('/deploy/:shipment/:environment/:provider',
    handlers.checkParams,
    auth.checkToken,
    catalog.register,
    shipit.update,
    trigger.execute,
    handlers.response
);

app.post('/catalog/:shipment/:environment/:provider',
    handlers.checkParams,
    auth.checkToken,
    catalog.register,
    handlers.response
);

app.get('/catalog/:image/:version',
    catalog.check,
    handlers.response
);

let server = app.listen(port, _ => debug('listening on %s', port));

module.exports = server;
