var express = require('express');
var router = express.Router();
var db = require('../lib/nedbtestero');
var conf = require('../config');
var fs = require('fs')



router.post('/db', function(req, res, next) { 
  console.log('сессия:')
  console.log(req.session);
  req.session.lolka = true;
  req.session.cookie.originalMaxAge = 666;
  var firstRun = true;
  if(firstRun) {
    res.json({
      msg: "Первый запуск!",
      status: 0
    })
  }
  else
  {
    res.json({
      msg: "Не первый запуск",
      status: 1
    })
  }
})



router.post("/modules", function(req, res, next) {
  
  var data = { };
  var moduleName = req.body.moduleName;
  var modulePath = '../modules/' + moduleName
  if(!fs.existsSync(modulePath))
  {
    data.status = false;
    data.msg = 'Модуль '+moduleName+' не найден'
    res.json(data)
    return;
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
  data.msg = "Модуль был импортирован!"
  res.json(data)

})

module.exports = router;
