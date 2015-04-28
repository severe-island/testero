var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.post('/updateProfile', function(req, res, next) {
  if(!req.session.login) {
    res.json({
      status: false,
      level: "danger",
      msg: "Функция доступна только зарегистрированным пользователям!"
    });
    return;
  }
  if(!req.body.email) {
    res.json({
      status: false,
      level: "danger",
      msg: "Не передан email!"
    });
    return;
  }
  
  var updater = { };
  if(req.body.name) {
    updater.name = req.body.name;
  }
  if(req.body.familyName) {
    updater.familyName = req.body.familyName;
  }
  if(req.body.patronymic) {
    updater.patronymic = req.body.patronymic;
  }
  
  db.findUserByEmail(req.session.email, function(err, user) {
    if(err) {
      res.json({
        status: false,
        level: "danger",
        msg: "Ошибка БД: " + err.message
      });
      return;
    }
    if(!user) {
      res.json({
        status: false,
        level: "danger",
        msg: "Пользователь не найден! Скорее всего, ошибка с сессией."
      })
      return;
    }
    if(!user.isAdministrator && req.session.email != req.body.email) {
      res.json({
        status: false,
        level: "danger",
        msg: "Только администратор может обновить чужой профиль!"
      })
      return;
    }
    db.updateUser(req.body.email, updater, function(err, numUpdated) {
      if(err) {
        res.json({
          status: false,
          level: "danger",
          msg: "Ошибка БД: " + err.message
        });
        return;
      }
      if(numUpdated<1) {
        res.json({
          status: false,
          level: "danger",
          msg: "Не найден пользователь для обновления его профиля!"
        });
        return;
      }
      res.json({
        status: false,
        level: "success",
        msg: "Профиль успешно обновлён!: "
      });
    })
  })
})

module.exports = router;
