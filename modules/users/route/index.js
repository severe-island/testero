"use strict"

const express = require('express')

/**
 * @typedef {Object} Settings
 * @property {mongodb.Db} mongoDBConnection
 * @param {Settings} settings
 */
module.exports = function(settings) {
  const router = express.Router()

  const db = require('../db')
  db.setup({mongoDBConnection: settings.mongoDBConnection})
  const lib = require('../lib/session')
  lib.setup({mongoDBConnection: settings.mongoDBConnection})

  router.post('/login', function(req, res, next) {
    return lib.checkSession(req)
      .then(checkResult => {
        if (checkResult.status) {
          var status, level;
          if (req.session.email === req.body.email) {
            status = true;
            level = "info";
          }
          else {
            status = false;
            level = "warning";
          }
          res.json({
            msg: "Вы уже зашли с почтой " + req.session.email + ".",
            status: status,
            level: level,
            user: checkResult.user
          });
          return;
        }
      
        var email = req.body.email;
        var password = req.body.password;
        var remember = (req.body.remember !== undefined);
        
        return db.findUserByEmail(email)
          .then(data => {
            if (!data) {
              res.json({
                msg: "User is not found",
                status: false, 
                level: "info"
              });
              return;
            }
            if (data.removed) {
              res.json({
                status: false,
                level: "info",
                msg: "The account is deleted"
              });
              return;
            }
            if (data.password !== password) {
              res.json({
                msg: "Incorrect password",
                status: false,
                level: "warning"
              });
              return;
            }
            let msg = "You entered.";
            if (!!remember) {
              msg += " I will try to remember you.";
              req.session.cookie.originalMaxAge = 1000*60*60;
            }
            else {
              req.session.cookie.originalMaxAge = null;
              req.session.cookie.expires = false;
            }
            req.session.login = true;
            req.session.email = email;
            delete data.password;
            req.session.user_id = data.id;
            res.json({
              msg: msg,
              status: true,
              level: "success",
              user: data
            });
      });
    });
  });


  router.post('/requestRemoving', function(req, res, next) {
    lib.checkSession(req, function(authorized) {
      if(!authorized) {
        res.json({
          status: true,
          level: "info",
          msg: "Вы не вошли, поэтому не можете себя удалить."
        });
        return;
      }
      db.updateUser(req.session.email, { removingRequested: true }, req.session.email, function(err) {
        if(err) {
          res.json({
            status: true,
            level: "info",
            msg: "Ошибка БД: " + err.message
          });
          return;
        }
        delete req.session.login;
        delete req.session.email;
        res.json({
          status: true,
          level: "info",
          msg: "Запрос на удаление оставлен."
        });
      });
    });
  });

  router.post('/removeUser', function(req, res, next) {
    lib.checkSession(req, function(authorized, user) {
      if(!authorized) {
        res.json({
          status: false,
          level: "danger",
          msg: "Сначала войдите в систему!"
        })
        return
      }
      if(!req.body.email) {
        res.json({
          status: false,
          level: "danger",
          msg: "Укажите email!"
        });
        return;
      }
      var targetEmail = req.body.email
      if(!user) {
        res.json({
          status: false,
          level: "danger",
          msg: "Сначала войдите в систему!"
        })
        return 
      }
      if(!user.isAdministrator && user.email!==targetEmail) {
        res.json({
          msg: "Пользователя может удалить только администратор или сам пользователь",
          status: false,
          level: "danger"
        });
        return;
      }
      db.removeUser(targetEmail, function(err) { 
        if(err) {
          res.json({
            msg: "Ошибка БД: " + err.message,
            status: false,
            level: "danger"
          });
          return;
        }
        res.json({
          msg: "Пользователь был удалён!: ",
          status: true,
          level: "success"
        });
        return;
      });
    });
  });
  return router
}
