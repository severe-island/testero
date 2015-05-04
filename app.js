var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var NedbStore = require('connect-nedb-session')(session);
var bodyParser = require('body-parser');
var config = require('./config')
var fs = require('fs')

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'sksskjfsdfkn2131',
  store: new NedbStore({ filename: '../db/'+config.mode+'/sessions', autoload: true, inMemoryOnly: false})
}));
app.use(express.static(path.join(__dirname, 'public')));

config.modules.forEach(function(moduleName){
  var modulePath = './modules/'+moduleName+'/route';
  if (fs.existsSync('.'+modulePath))
  {
    var files = fs.readdirSync('.'+modulePath)
    if (files) {
      files.forEach(function (file) {
        var nextModule = require(modulePath+'/'+file);
        app.use('/'+moduleName, nextModule);
      })
    } 
  }
  console.log('Модуль '+moduleName+' подключен.')
})

var modulesRoute = require('./modules');
app.use('/modules', modulesRoute);

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
    res.status(err.status || 500);
    res.json({
      msg: err.message,
      status: 0
    });
  });
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

module.exports = app;