var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.post('/login', function(req, res, next) {
  if(req.session.login) {
    res.json({
      msg: "Вы уже зашли с почтой " + req.session.email + "!",
      status: true,
      level: "info"
    });
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
        status: false, 
        level: "info"
      })
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
        status: true,
        level: "success"
      });
    }
    else {
      res.json({
        msg: "Неверный пароль!",
        status: false,
        level: "info"
      });
    }
  });
});

router.post('/logout', function(req, res, next) {
  if(req.session.login)
  { 
    delete req.session.login;
    var email = req.session.email;
    delete req.session.email;
    //req.session.destroy()
    res.json({
      msg: "Вы вышли и теперь вы больше не "+email+"!",
      status: true,
      level: "info"
    });
  }
  else
  {
    res.json({
      msg: "Так ведь вы и не входили!",
      status: true,
      level: "info"
    });
  }
});

router.post('/signup', function(req, res, next) {
  console.log(req.body);
  if(req.session.login)
  {
    res.json({
      msg: "Вы уже вошли как "+ req.session.email +"! Зачем вам регистрироваться?",
      status: false,
      level: "warning"
    });
    return;
  }
  var email = req.body.email;
  var password = req.body.password;
  var passwordDuplicate = req.body.passwordDuplicate;
  db.findUserByEmail(email, function(err, data) {
    if(err)
    {
      res.json({
        msg: "Ошибка БД: " + err.message,
        status: false,
        level: "danger"
      });
      return;
    }
    if(data!=null)
    {
      res.json({
        msg: "Такой пользователь с этой почтой уже есть!",
        status: false,
        level: "danger"
      });
      return;
    }
    if (password != passwordDuplicate)
    {
      res.json({
        msg: "Пароли не совпадают!",
        status: false,
        level: "danger"
      });
      return;
    }
    if(email.indexOf('@')<0)
    {
      res.json({
        msg: "Некорректный email!",
        status: false,
        level: "danger"
      });
    }
    db.addNewUser(email, password, false, function(err) {
      if(err)
      {
        res.json({
          msg: "Ошибка БД: " + err.message,
          status: false,
          level: "danger"
        });
        return;
      }
      req.session.login = true;
      req.session.email = email;
      res.json({
        msg: "Пользователь успешно зарегистрирован!",
        status: true,
        level: "success"
      });
    });
  });
}); 

module.exports = router;
