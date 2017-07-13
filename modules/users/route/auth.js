"use strict"

const express = require('express')

module.exports = function(connection) {
  const router = express.Router()

  const db = require('../db')
  db.setup(connection)
  const lib = require('../lib/session')
  lib.setup(connection)

  router.get('/users/:id/auth', function(req, res) {
    db.findUserById(req.params.id, function(err, data) {
      if (err) {
        res.json({
          status: false,
          level: 'danger',
          msg:
            process.env.NODE_ENV !== 'production'
            ? 'Ошибка базы данных: "' + err.message + '".'
            : 'Внутренняя ошибка сервера.'
        });
        return;
      }
      
      if (!!data) {
        lib.checkSession(req, function(checkResult) {
          if (checkResult.status) {
            if (data.email === checkResult.user.email) {
              res.json({
                status: true,
                level: 'success',
                msg: 'Пользователь авторизован.'
              });
            }
            else {
              res.json({
                status: false,
                level: 'warning',
                msg: 'Запрос авторизованности допустим только самим пользователем'
              });
            }
          }
          else {
            res.json(checkResult);
          }
        });
      }
      else {
        res.json({
          status: false,
          level: 'info',
          msg: 'Пользователь не найден.'
        });
      }
    });
  });


  router.post('/users/:id/auth', function(req, res, next) {
    if (!req.params.id) {
      res.json({
        status: false,
        level: 'warning',
        msg: 'Не задан ID пользователя.'
      });
      return;
    }
    
    if (!req.body.password) {
      res.json({
        status: false,
        level: 'warning',
        msg: 'Не задан пароль пользователя.'
      });
      return;
    }
    
    var password = req.body.password;
    var remember = !!req.body.remember;
    db.findUserById(req.params.id, function(err, data) {
      if (err) {
        res.json({
          status: false,
          level: 'danger',
          msg:
            process.env.NODE_ENV !== 'production'
            ? 'Ошибка базы данных: "' + err.message + '".'
            : 'Внутренняя ошибка сервера.'
        });
        return;
      }

      if (!!data) {
        db.findUserByEmail(data.email, function(err, data){
          if (err) {
            res.json({
              status: false,
              level: 'danger',
              msg:
                process.env.NODE_ENV !== 'production'
                ? 'Ошибка базы данных: "' + err.message + '".'
                : 'Внутренняя ошибка сервера.'
            });
            return;
          }
          
          if (!data) {
            res.json({
              msg: "Пользователь не найден.",
              status: false, 
              level: "info"
            });
            return;
          }

          if (data.removed) {
            res.json({
              status: false,
              level: "info",
              msg: "Ваш аккаунт удалён."
            });
            return;
          }
          if (data.password !== password) {
            res.json({
              msg: "Неверный пароль.",
              status: false,
              level: "warning"
            });
            return;
          }
          var msg = "Вы авторизовались.";
          if (!!remember) {
            msg += " Я постараюсь вас запомнить.";
            req.session.cookie.originalMaxAge = 1000*60*60;
          }
          else {
            req.session.cookie.originalMaxAge = null;
            req.session.cookie.expires = false;
          }
          req.session.login = true;
          req.session.email = data.email;
          req.session.user_id = data._id;
          res.json({
            msg: msg,
            status: true,
            level: "success"
          });
        });
      }
      else {
        res.json({
          msg: "Пользователь не найден.",
          status: false, 
          level: "info"
        });
      }
    });
  });


  router.delete('/users/:id/auth', function(req, res, next) {
    lib.checkSession(req, function(checkResult) {
      if (checkResult.status) {
        req.session.login = false;
        var email = req.session.email;
        res.json({
          msg: "Вы вышли и теперь больше не " + email + ".",
          status: true,
          level: "success"
        });
      }
      else {
        checkResult.status = true;
        res.json(checkResult);
      }
    });
  });

  return router
}
