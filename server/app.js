var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var routes = require('./routes/index');
var maps = require('./routes/map');
var locto = require('./routes/locto');
var signrest = require('./routes/sign_rest');
// var users = require('./routes/users');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('views', path.join('../', 'views'));
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
// app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '..','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(bodyParser.json({ type: 'application/*+json' ,limit: '1mb'}))
// app.use(bodyParser.json({limit: '1mb'}));

// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/users', users);
app.use('/', maps);
app.use('/', locto);
// app.use('/sign', signrest);
// app.use('/', routes);

app.use('/skins', express.static('../skins'));
app.use('/tempData', express.static('../tempData'));
app.use('/templates', express.static('../templates'));
app.use('/views', express.static('../views'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log('development');
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log('product');
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
// var jsonParser = bodyParser.json()
//
// // POST /login gets urlencoded bodies
// app.post('/sign', urlencodedParser, function (req, res) {
//   if (!req.body) return res.sendStatus(400)
//   res.send('welcome, ' + req.body.username)
// })


module.exports = app;

var port = 3000;
if (process.argv.length <= 2) {
  console.log("Usage: " + __filename + " SOME_PARAM");
  app.listen(port, function () {
    console.log('Example app listening on port ' + port);
  });
} else {
  port = process.argv[2];
  console.log('port:' + port);
  app.listen(port, function () {
    console.log('Example app listening on port ' + port);
  });
}

var param = process.argv[2];

