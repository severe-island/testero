"use strict"

const express = require('express')

module.exports = function(connection) {
  const router = express.Router()

  const db = require('../db')
  db.setup(connection)
  const lib = require('../lib/session')
  lib.setup(connection)

  router.get('/users/:id', function(req, res) {
    if (!req.params.id) {
      res.json({
        status: false,
        level: "danger",
        msg: "Не задан идентификатор пользователя."
      });
      return;
    }

    lib.checkSession(req, function(checkResult) {
      if (checkResult.status) {
        db.findUserById(req.params.id, function(err, data) {
          if (err) {
            var msg = 'Ошибка базы данных' 
              + (process.env.NODE_ENV !== 'production' ? ': ' + err.message : '.');
            res.json({
              status: false,
              level: "danger",
              msg: msg
            });
            return;
          }
          
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
        findUserById(req.params.id, false, res);
      }
    });
  });

  function findUserById(id, admin, res) {
    db.findUserByIdWithoutPassword(id, admin, function(err, user) {
      if (err) {
        var msg = 'Ошибка базы данных' 
          + (process.env.NODE_ENV !== 'production' ? ': ' + err.message : '.');
        res.json({
          status: false,
          level: "danger",
          msg: msg
        });
        return;
      }
      
      if (!user) {
        res.json({
          status: false,
          level: "info",
          msg: "Пользователь не найден."
        });
        return;
      }
      
      user.id = user._id;
      
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
      
      db.findUserByEmail(req.session.email, function(err, user) {
        if (err || !user || !user.isAdministrator) {
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

      db.findUserByEmail(req.session.email, function(err, user) {
        if (err || !user || !user.isAdministrator) {
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
    db.findUserByEmailWithoutPassword(email, admin, function(err, user) {
      if (err) {
        var msg = 'Ошибка базы данных' 
          + (process.env.NODE_ENV !== 'production' ? ': ' + err.message : '.');
        res.json({
          status: false,
          level: "danger",
          msg: msg
        });
        return;
      }
      
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

    lib.checkSession(req, function(checkResult) {
      var initiator = checkResult.status ? checkResult.user : undefined;
      var registeredBy = initiator ? initiator.email : undefined;

      db.findUserByEmail(email, function(err, user) {
        if (err) {
          var msg = 'Ошибка базы данных' 
            + (process.env.NODE_ENV !== 'production' || initiator.isAdministrator ? ': ' + err.message : '.');
          res.json({
            status: false,
            level: "danger",
            msg: msg
          });
          return;
        }

        if (user) {
          res.json({
            status: false,
            level: "danger",
            msg: "Пользователь " + email + " уже существует."
          });
          return;
        }

        db.isAdminExists(function(adminExists) {
          var user = {
            email: email,
            password: password,
            isAdministrator: !adminExists,
            registeredBy: registeredBy
          };
          db.registerUser(user, function(err, newUser) {
            if (err) {
              var msg = 'Ошибка базы данных' 
                + (process.env.NODE_ENV !== 'production' ? ': ' + err.message : '.');
              res.json({
                status: false,
                level: "danger",
                msg: msg
              });
              return;
            }

            delete newUser.password;

            var msg = adminExists 
              ? "Пользователь (" + email + ") успешно зарегистрирован."
              : "Первый пользователь (" + email + ") успешно зарегистрирован и назначен администратором.";
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
    lib.checkSession(req, function(checkResult) {
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
      
      db.clearUsers(function(err) {
        if (err) {
          res.json({
            msg: "Ошибка БД: " + err.message,
            status: false,
            level: "danger"
          });
          return;
        }
        
        res.json({
          msg: "Все пользователи были удалены!",
          status: true,
          level: "success"
        });
      });
    });
  });

  return router
}
