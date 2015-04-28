var express = require('express');
var router = express.Router();
var conf = require('../../../config');
var fs = require('fs')
var usersDB = require('../../users/db')

var app;

router.post("/", function(req, res, next) {
  if(app && conf.mode!="development") {
    res.json(app);
    return;
  }
  app = { };
  app.modules = { };
  loadModule(0, function () {
    app.isLoggedIn = (req.session.login!==undefined);
    usersDB.findUserByEmail(req.session.email, function (err, user) {
      if(err) {
        res.json({
          status:false,
          level: "danger",
          msg: err.message
        });
        return;
      }
      app.mode = conf.mode;
      app.status = true;
      app.level = "success";
      app.msg = "app успешно загружен.";
      app.user = user;
      res.json(app);
    }) 
    
  })
})

function loadModule(i, callback) {
  var data = { };
  var moduleName = conf.modules[i];
  data.moduleName = moduleName;
  var modulePath = '../modules/' + moduleName
  if(!fs.existsSync(modulePath))
  {
    data.status = false;
    data.msg = 'Модуль '+moduleName+' не найден'
    data.level = "warning"
    app.modules[moduleName] = data;
    console.log("Модуль", moduleName, "не найден!");
    if(conf.mode !== "development") {
      return;
    }
  }
  if (fs.existsSync(modulePath + '/html')) {
    var htmlFiles = fs.readdirSync(modulePath + '/html')
    data.html = {}
    if (htmlFiles) {
      htmlFiles.forEach(function (file) {
        data.html[file.replace(/\.[^/.]+$/, "")] = fs.readFileSync(modulePath + '/html/' + file, encoding = 'utf8')
      })
    }
  }
  if (fs.existsSync(modulePath + '/js')) {
    var jsFiles = fs.readdirSync(modulePath + '/js')
    data.js = {}
    if (jsFiles) {
      jsFiles.forEach(function (file) {
        data.js[file.replace(/\.[^/.]+$/, "")] = fs.readFileSync(modulePath + '/js/' + file, encoding = 'utf8')
      })
    }
  }
  data.status = true;
  data.msg = "Модуль " + moduleName + " был импортирован!"
  data.level = "success"
  app.modules[moduleName] = data;
    if(i==conf.modules.length-1) {
    callback();
  } else {
    loadModule(i+1, callback);
  }
}

module.exports = router;
