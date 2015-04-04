var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var db = require('./lib/dbtestero'); 

var routes = require('./routes/index');

var child_process = require('child_process');
var spawn = child_process.spawn;
var mongodProcess = spawn('mongod', ['--dbpath=../db/mongodb', '--nojournal', '--auth']);
mongodProcess.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});
var firstRun = true;
var stage = 0;
db.connect(true, function(status){
  if(stage>0)
  {
    console.log(stage);
    return;
  }
  firstRun = status;
  if(!status) {
    stage++;
    console.log("Первый запуск!");
    db.disconnect(function () {
      console.log("Отключился");
      if (!/^win/.test(process.platform)) {
        mongodProcess.kill("SIGHUP");
      }
      else {
        child_process.exec('taskkill /PID ' + mongodProcess.pid + ' /T /F', function (error, stdout, stderr) {
          // console.log('stdout: ' + stdout);
          // console.log('stderr: ' + stderr);
          // if(error !== null) {
          //      console.log('exec error: ' + error);
          // }
        });
      }
      mongodProcess = spawn('mongod', ['--dbpath=../db/mongodb', '--nojournal', '--noauth']);
      db.connect(false, function (status) {
        if (!status) {
          console.log("Второй раз не получилось подключиться!");
        }
        else {
          console.log("Подключились второй раз без авторизации");
        }
      });
      routes.setFirstRun(true);
    });
  }
  else
  {
    console.log("Непервый запуск.");
    routes.setFirstRun(false);
  }
  routes.setDB(db);
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'sksskjfsdfkn2131',
  store: new MongoStore({ mongooseConnection: db.connection })
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

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
    res.render('error', {
      message: err.message,
      error: err
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
