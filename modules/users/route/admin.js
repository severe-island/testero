var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.post('/registerAdministrator', function(req, res, next) {
  db.isAdminExists(function(adminExists){
    if(!adminExists)
    {
      registerAdministrator(req, res);
    }
    else
    {
      if(!req.session.login)
      {
        res.json({
          msg: "Это не первый запуск. Сначала войдите под именем администратора!",
          status: false,
          level: "danger"
        });
        return;
      }
      db.findUserByEmail(req.body.email, function(err, data) {
        if(err || data==null) {
          res.json({
            msg: "Не могу убедиться в том, что вы админ. О вас нет информации в БД!"+
              "Возможно, ошибка в сессии. Попробуйти выйти и снова зайти под своим логином.",
            status: false,
            level: "danger"
          });
          return;
        }
        if(!data.isAdministrator)
        {
          res.json({
            msg: "Это не первый запуск. Только администратор может регистрировать админов!",
            status: false,
            level: "danger"
          });
          return;
        }
        registerAdministrator(req, res);
      }); 
    }
  }); 
}); 

function registerAdministrator(req, res) {
  var email = req.body.email
  var password = req.body.password
  var passwordDuplicate = req.body.passwordDuplicate;
  db.findUserByEmail(email, function(err, data) {
    if(err)
    {
      res.json({
        msg: "Ошибка БД: " + err.message,
        status: false,
        level: "danger"
      })
      return;
    }
    if(data!=null)
    {
      res.json({
        msg: "Такой пользователь с этой почтой уже есть!",
        status: false,
        level: "danger"
      })
      return;
    }
    if(password!=passwordDuplicate)
    {
      res.json({
        msg: "Пароли не совпадают!",
        status: false,
        level: "danger"
      })
      return;
    }
    if(email.indexOf('@')<0)
    {
      res.json({
        msg: "Некорректный email!",
        status: false,
        level: "danger"
      })
      return;
    }
    db.addNewUser(email, password, true, function(err) {
      if(err)
      {
        res.json({
          msg: "Ошибка БД: " + err.message,
          status: false,
          level: "danger"
        })
        return;
      }
      req.session.login = true;
      req.session.email = email;
      res.json({
        msg: "Пользователь успешно зарегистрирован!",
        status: true,
        level: "success"
      }) 
    })
  }) 
}

router.get('/isAdminExists', function(req, res, next) { 
  db.isAdminExists(function(adminExists){
    if(!adminExists) {
      res.json({
        msg: "Админа ещё нет!",
        status: false,
        level: "info"
      })
    }
    else
    {
      res.json({
        msg: "Админ уже есть!",
        status: true,
        level: "info"
      })
    }
  })
})

router.post('/setAsAdministrator', function(req, res, next) { 
  if(!req.session.login) {
    res.json({
      msg: "Сначала войдите в систему!",
      status: false,
      level: "danger"
    })
    return;
  }
  if(!req.body.email) {
    res.json({
      msg: "Укажите email!",
      status: false,
      level: "danger"
    })
    return;
  }
  var email = req.body.email;
  db.findUserByEmail(req.session.email, function(err, user) {
    if(err) {
      res.json({
        msg: "Ошибка бд: "+err.message,
        status: false,
        level: "danger"
      })
      return;
    }
    if(!user) {
      res.json({
        msg: "Сначала войдите в систему!",
        status: false,
        level: "danger"
      })
      return;
    }
    if(!user.isAdministrator) {
      res.json({
        msg: "Только администратор может назначить администратора!",
        status: false,
        level: "danger"
      })
      return;
    }
    db.setAsAdministrator(email, function(err) {
      if(err) {
        res.json({
          msg: "Ошибка бд: "+err.message,
          status: false,
          level: "danger"
        })
        return;
      }
      res.json({
        msg: "Теперь "+email+" администратор!",
        status: true,
        level: "access"
      })
    })
  })
})

module.exports = router;
