var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');
var lib = require('../lib/session');

router.get('/users/:id', function(req, res) {
  if (!req.params.id) {
    res.json({
      status: false,
      level: "danger",
      msg: "Не задан идентификатор пользователя."
    });
    return;
  }

  if (!req.session.login) {
    findUserById(req.params.id, false, res);
    return;
  }

  db.findUserByEmail(req.session.email, function(err, user) {
    if (err || !user || !user.isAdministrator) {
      findUserById(req.params.id, false, res);
    } else {
      findUserById(req.params.id, true, res);
    }
  });
});

function findUserById(id, admin, res) {
  db.findUserByIdWithoutPassword(id, admin, function(err, user) {
    if (err) {
      var msg = 'Ошибка базы данных' 
        + (conf.mode !== 'production' ? ': ' + err.message : '.');
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
  db.findAllUsersWithoutPassword(admin, function(err, users) {
    if (err) {
      var msg = 'Ошибка базы данных' 
        + (conf.mode !== 'production' ? ': ' + err.message : '.');
      res.json({
        status: false,
        level: "danger",
        msg: msg
      });
      return;
    }
    
    res.json({
      status: true,
      level: "success",
      msg: "Список всех пользователей получен.",
      users: users
    });
  });
}

function findUserByEmail(email, admin, res) {
  db.findUserByEmailWithoutPassword(email, admin, function(err, user) {
    if (err) {
      var msg = 'Ошибка базы данных' 
        + (conf.mode !== 'production' ? ': ' + err.message : '.');
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
          + (conf.mode !== 'production' || initiator.isAdministrator ? ': ' + err.message : '.');
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
              + (conf.mode !== 'production' ? ': ' + err.message : '.');
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


module.exports = router;
