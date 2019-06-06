var createError = require('http-errors');
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
const fileUpload = require('express-fileupload');

const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev', {skip: (req)=> (req.baseUrl !== "/api")}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(allowCrossDomain);

app.use(fileUpload());
app.use('/images', express.static('public/images'), serveIndex('public/images', {'icons': true}))
app.use('/api', recipeApi);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
        deepLinking: true,
    }
}));

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (e, req, res, next) {
    if (res.headersSent) {
        return next(e)
    }
    res.status(e.status || 500);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(e));
});
module.exports = app;
