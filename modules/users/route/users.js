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
  db.setup(settings)
  const lib = require('../lib/session')
  lib.setup(settings)

  router.get('/users/:id', function(req, res) {
    return lib.checkSession(req)
      .then(checkResult => {
        if (checkResult.status) {
          return db.findUserById(req.params.id)
            .then(data => {
              if (!data) {
                res.json({
                  status: false,
                  level: 'info',
                  msg: 'Пользователь не найден.'
                });
                return;
              }
              
              delete data.password;

              res.json({
                status: true,
                level: 'success',
                msg: 'Пользователь найден.',
                user: data
              });
          });
        }
        else {
          return findUserById(req.params.id, false, res);
        }
      });
  });

  function findUserById(id, admin, res) {
    return db.findUserByIdWithoutPassword(id, admin)
      .then(user => {
        if (!user) {
          res.json({
            status: false,
            level: "info",
            msg: "Пользователь не найден."
          });
          return;
        }
        
        res.json({
          status: true,
          level: "success",
          msg: "Пользователь найден.",
          user: user
        });
    });
  }


  router.get('/users/', function(req, res, next) {
    if (!!req.query['email']) { // by email
      if (!req.session.login) {
        findUserByEmail(req.query['email'], false, res);
        return;
      }
      
      return db.findUserByEmail(req.session.email)
        .then(user => {
        if (!user || !user.isAdministrator) {
          findUserByEmail(req.query['email'], false, res);
        } else {
          findUserByEmail(req.query['email'], true, res);
        }
      });
    }
    else { // all
      if (!req.session.login) {
        findAllUsers(false, res);
        return;
      }

      return db.findUserByEmail(req.session.email)
        .then(user => {
        if (!user || !user.isAdministrator) {
          findAllUsers(false, res);
        } else {
          findAllUsers(true, res);
        }
      });
    }
  });

  function findAllUsers(admin, res) {
    db.findAllUsersWithoutPassword(admin).then(users => {
      res.json({
        status: true,
        level: "success",
        msg: "List of all users received.",
        users: users
      })
    })
    .catch(err => {
      res.status(500)
      res.json({
        status: false,
        level: "danger",
        msg:
          process.env.NODE_ENV !== 'production'
          ? 'Database error: "' + err.message + '".'
          : 'Internal server error'
      })
    })
  }

  function findUserByEmail(email, admin, res) {
    return db.findUserByEmailWithoutPassword(email, admin)
      .then(user => {
        if (!user) {
          res.json({
            status: false,
            level: "info",
            msg: "Пользователь не найден."
          });
          return;
        }
        
        res.json({
          status: true,
          level: "success",
          msg: "Пользователь найден.",
          user: user
        });
      });
  }


  router.post("/users/", function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var passwordDuplicate = req.body.passwordDuplicate;

    if (!email) {
      res.json({
        level: "danger",
        status: false,
        msg: "Не задан email нового пользователя."
      });
      return;
    }
    
    if (email.indexOf('@')<0) {
      res.json({
        msg: "Некорректный email нового пользователя.",
        status: false,
        level: "danger"
      });
      return;
    }

    if (!password) {
      res.json({
        level: "danger",
        status: false,
        msg: "Не задан пароль (password) нового пользователя."
      });
      return;
    }

    if (!passwordDuplicate) {
      res.json({
        level: "danger",
        status: false,
        msg: "Не задано подтверждение пароля (passwordDuplicate)."
      });
      return;
    }

    if (password !== passwordDuplicate) {
      res.json({
        level: "danger",
        status: false,
        msg: "Пароль и подтверждение пароля не совпадают."
      });
      return;
    }

    return lib.checkSession(req)
      .then(checkResult => {
        let initiator = checkResult.status ? checkResult.user : undefined
        return {
          initiator: initiator,
          registeredBy: initiator ? initiator.email : undefined
        }
      })
      .then(data => {
        return db.findUserByEmail(email)
          .then(user => {
            if (user) {
              res.json({
                status: false,
                level: "danger",
                msg: "Пользователь " + email + " уже существует."
              });
              return;
            }

            db.isAdminExists(function(adminExists) {
              let user = {
                email: email,
                password: password,
                isAdministrator: !adminExists,
                registeredBy: data.registeredBy
              }

              return db.registerUser(user)
                .then(newUser => {
                  delete newUser.password;

                  let msg = adminExists 
                    ? "Пользователь (" + email + ") успешно зарегистрирован."
                    : "Первый пользователь (" + email + ") успешно зарегистрирован и назначен администратором."

                  res.json({
                    status: true,
                    level: "success",
                    msg: msg,
                    user: newUser
                  });
                });
            });
        });
    });
  });


  router.delete('/users', function(req, res, next) {
    return lib.checkSession(req)
      .then(checkResult => {
        if (!checkResult.status) {
          res.json(checkResult);
          return;
        }
        
        if (!checkResult.user) {
          res.json({
            status: false,
            level: "danger",
            msg: "Сначала войдите в систему."
          });
          return;
        }
        
        if (!checkResult.user.isAdministrator) {
          res.json({
            msg: "Очистить базу пользователей может только администратор.",
            status: false,
            level: "danger"
          });
          return;
        }
        
        return db.clearUsers()
          .then(() => {
            res.json({
              msg: "Все пользователи были удалены!",
              status: true,
              level: "success"
            });
          })
    });
  });

  return router
}
