"use strict"

const express = require('express')
const fs = require('fs')
const path = require('path')
const cookieParser = require('cookie-parser')
const favicon = require('serve-favicon')
const logger = require('morgan')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

const config = require('config')

module.exports = function(connection) {

  var app = express();

  if (config.mode !== "testing") {
    app.use(logger('dev'));
  }
  app.use(favicon(__dirname + '/public/favicon.ico'))
  app.use(express.json())
  app.use(express.urlencoded({extended: false}))
  app.use(cookieParser());
  app.use(session({
    secret: 'sksskjfsdfkn2131',
    store: new RedisStore({
      prefix: 'testero:session:'
    }),
    resave: true,
    saveUninitialized: false
  }));
  app.use(express.static(path.join(__dirname, 'public')));

  config.modules.forEach(function (moduleName) {
    const modulePath = './modules/' + moduleName + '/route'
    
    if (fs.existsSync(modulePath)) {
      const files = fs.readdirSync(modulePath)
      if (files) {
        files.forEach(function (file) {
          const nextModule = require(modulePath + '/' + file)(connection)
          app.use('/' + moduleName, nextModule)
        });
      }
    }
    else {
      console.log('Module ' + moduleName + ' does not contain routes.')
    }

    if (config.mode !== "testing") {
      console.log('Module ' + moduleName + ' enabled.');
    }
  });

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development' || app.get('env') === 'testing') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.json({
        msg: err.message,
        status: false
      });
      next(err);
    });
  }

  // production error handler
  // no stacktraces leaked to user
  if (app.get('env') === 'production') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.json({
        msg: 'Internal server error.',
        status: false
      });
      next(err);
    });
  }

  return app
}
