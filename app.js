'use strict'

var express = require('express');
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var routes = require('./routes/index');
var config = require('./config');

var app = module.exports = express();
console.log('App starting');

/*** Helmet ***/
var helmet = require('helmet');

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.xssFilter());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// setup the logger

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
/*app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://192.168.1.172:8080");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE")
  next();
});*/
require('./routes')(app);

app.use('/static', express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.set('jwtTokenSecret', 'add-yours-here');

global.catchError = function catchError(res, err, opt) {
    const source = opt ? opt.source  : null;
    console.error(source || null, err);
    let errorCode = opt && opt.code ? opt.code : 400;
    if (process.env.NODE_ENV !== 'production') {
        res.status(errorCode).json({success: false, msg: err})
    } else {
        res.status(errorCode).json({success: false, msg: opt.prodMsg})
    }
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.listen(config.port, function () {
    console.log(`App listening on port ${config.port}!`);
});


module.exports = app;