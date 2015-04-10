var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.post('/addAdmin', function(req, res, next) {
  console.log(req.body);
  db.isAdminExists(function(adminExists){
    if(!adminExists)
    {
      addAdmin(req, res);
    }
    else
    {
      if(!req.session.login)
      {
        res.json({
          msg: "Это не первый запуск. Сначала войдите под именем администратора!",
          status: false
        });
        return;
      }
      db.findUserByEmail(req.body.email, function(err, data) {
        if(err || data==null) {
          res.json({
            msg: "Не могу убедиться в том, что вы админ. О вас нет информации в БД!"+
              "Возможно, ошибка в сессии. Попробуйти выйти и снова зайти под своим логином.",
            status: false
          });
          return;
        }
        if(data.permission != 'admin')
        {
          res.json({
            msg: "Это не первый запуск. Только администратор может регистрировать админов!",
            status: false
          });
          return;
        }
        addAdmin(req, res);
      }); 
    }
  }); 
}); 

function addAdmin(req, res) {
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
      return;
    }
    db.addNewUser(email, password, 'admin', function(err) {
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
}

router.post('/isAdminExists', function(req, res, next) { 
  db.isAdminExists(function(adminExists){
    if(!adminExists) {
      res.json({
        msg: "Админа ещё нет!",
        status: 0
      })
    }
    else
    {
      res.json({
        msg: "Админ уже есть!",
        status: 1
      })
    }
  })
})

module.exports = router;

