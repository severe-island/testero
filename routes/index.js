var express = require('express');
var router = express.Router();
var db = require('../lib/dbtestero');
var conf = require('../config');
var fs = require('fs')

router.post('/login', function(req, res, next) {
  console.log(req.session)
  if(req.session.login)
  {
    res.json({
      msg: "Вы уже зашли с почтой "+req.session.email+"!",
      status: true })
    return;
  }
  console.log("Попытка входа!");
  var email = req.body.email
  var password = req.body.password
  var remember = (req.body.remember!=undefined)
  console.log("email: "+email)
  console.log("remember: "+remember)
  db.findUserByEmail(email, function(err, data){
    if(err || data==null) {
      res.json({
        msg: "Пользователь не найден!",
        status: false })
    }
    else if(data.password==password) {
      var msg = "Вы вошли!"
      if(remember){
        msg+=" Я постараюсь вас запомнить."
        req.session.cookie.originalMaxAge = 1000*60*60;
      }
      else {
        req.session.cookie.originalMaxAge = null
        req.session.cookie._expires = false
      }
      req.session.login = true
      req.session.email = email
      res.json({
        msg: msg,
        status: true })
    }
    else {
      res.json({
        msg: "Неверный пароль!",
        status: false })
    }
  });
});

router.post('/logout', function(req, res, next) {
  if(req.session.login)
  { 
    delete req.session.login
    var email = req.session.email
    delete req.session.email
    req.session.destroy()
    res.json({ msg: "Вы вышли и теперь вы больше не "+email+"!" })
  }
  else
  {
    res.json({ msg: "Так ведь вы и не входили!" })
  }
});

router.post('/signup', function(req, res, next) {
  console.log(req.body);
  if(req.session.login)
  {
    res.json({ 
      msg: "Вы уже вошли как "+ req.session.email +"! Зачем вам регистрироваться?",
      status: false
    })
    return;
  }
  var email = req.body.email
  var password = req.body.password
  var passwordDuplicate = req.body.passwordDuplicate;
  db.findUserByEmail(email, function(err, data) {
    if(err)
    {
      res.json({
        msg: "Ошибка БД: " + err.message,
        status: false
      })
      return;
    }
    if(data!=null)
    {
      res.json({
        msg: "Такой пользователь с этой почтой уже есть!",
        status: false
      })
      return;
    }
    if(password!=passwordDuplicate)
    {
      res.json({
        msg: "Пароли не совпадают!",
        status: 0
      })
      return;
    }
    if(email.indexOf('@')<0)
    {
      res.json({
        msg: "Некорректный email!",
        status: 0
      })
    }
    db.addNewUser(email, password, function(err) {
      if(err)
      {
        res.json({
          msg: "Ошибка БД: " + err.message,
          status: false
        })
        return;
      }
      req.session.login = true;
      req.session.email = email;
      res.json({
        msg: "Пользователь успешно зарегистрирован!",
        status: true 
      }) 
    })
  })
});

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
  var htmlFiles = fs.readdirSync(modulePath + '/html')
  data.html = { }
  htmlFiles.forEach(function(file){
    data.html[file.replace(/\.[^/.]+$/,"")] = fs.readFileSync(modulePath+'/html/'+file, encoding='utf8')
  })
  
  var jsFiles = fs.readdirSync(modulePath + '/js')
  data.js = { }
  jsFiles.forEach(function(file){
    data.js[file.replace(/\.[^/.]+$/,"")] = fs.readFileSync(modulePath+'/js/'+file, encoding='utf8')
  })
  
  data.status = true;
  data.msg = "Модуль был импортирован!"
  res.json(data)
})

module.exports = router;
