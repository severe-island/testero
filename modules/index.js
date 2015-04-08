var express = require('express');
var router = express.Router();
var conf = require('../config');
var fs = require('fs')

router.post("/", function(req, res, next) {
  
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

  var inConfiguration = false;
  for(var i = 0; i<conf.modules.length; i++)
  {
    if(conf.modules[i]===moduleName) inConfiguration = true;
  }
  if(!inConfiguration)
  {
    data.status = false;
    data.msg = 'Модуль '+moduleName+' не прописан в конфигурации.'
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
