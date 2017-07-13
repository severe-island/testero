"use strict"

const express = require('express')

module.exports = function(connection) {
  const router = express.Router()

  const db = require('../db')
  db.setup(connection)
  const lib = require('../lib/session')
  lib.setup(connection)
  
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
    if(req.body.showEmail!==undefined) {
      updater.showEmail = req.body.showEmail;
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
          msg: "Вы не найдены в базе! Скорее всего, ошибка с сессией."
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
      db.findUserByEmail(req.body.email, function(err, targetUser) {
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
            msg: "Пользователь " + req.body.email + " не найден!"
          })
          return;
        }
        if(updater.password && req.body.oldPassword != targetUser.password)
        {
          res.json({
            status: false,
            level: "danger",
            msg: "Неверный пароль!"
          });
          return;
        }
        
        db.updateUser(req.body.email, updater, req.session.email, function(err, numUpdated) {
          if(err) {
            res.json({
              status: false,
              level: "danger",
              msg: "Ошибка БД: " + err.message
            });
            return;
          }
          res.json({
            status: true,
            level: "success",
            msg: "Профиль успешно обновлён!: "
          });
        })
      })
    })
  })

  router.post('/updatePassword', function(req, res, next) {
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
    
    if(req.body.password) {
      if(!req.body.passwordDuplicate) {
        res.json({
          status: false,
          level: "danger",
          msg: "Нужно передать также passwordDuplicate!"
        });
        return;
      }
      if(!req.body.oldPassword) {
        res.json({
          status: false,
          level: "danger",
          msg: "Для смены пароля нужно подтвердить старый пароль! (oldPassword)"
        });
        return;
      }
      if(req.body.password != req.body.passwordDuplicate)
      {
        res.json({
          status: false,
          level: "danger",
          msg: "Новый пароль и его подтверждение не совпадают!"
        });
        return;
      }
      updater.password = req.body.password;
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
          msg: "Вы не найдены в базе! Скорее всего, ошибка с сессией."
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
      db.findUserByEmail(req.body.email, function(err, targetUser) {
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
            msg: "Пользователь " + req.body.email + " не найден!"
          })
          return;
        }
        if(updater.password && req.body.oldPassword != targetUser.password)
        {
          res.json({
            status: false,
            level: "danger",
            msg: "Неверный пароль!"
          });
          return;
        }
        
        db.updateUser(req.body.email, updater, req.session.email, function(err, numUpdated) {
          if(err) {
            res.json({
              status: false,
              level: "danger",
              msg: "Ошибка БД: " + err.message
            });
            return;
          }
          res.json({
            status: true,
            level: "success",
            msg: "Профиль успешно обновлён!: "
          });
        })
      })
    })
  });

  return router;
}
