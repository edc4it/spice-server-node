const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const recipeApi = require('./routes/recipe-api');
const serveIndex = require('serve-index');
const app = express();
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(allowCrossDomain);


app.use('/images', express.static('public/images'),serveIndex('public/images', {'icons': true}))
app.use('/api', recipeApi);

var options = {
    // explorer : true,
    swaggerOptions: {
        deepLinking: true,
    }
};

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
// app.get('/', swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers (dev-style, renders errors)
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});
module.exports = app;
