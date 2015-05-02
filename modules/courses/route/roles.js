var express = require('express');
var router = express.Router();
var roles = require('../db/roles');
var conf = require('../../../config');
var usersDB = require('../../users/db');

router.post('/assignRole', function(req, res, next) {
  if(!req.session.login) {
    res.json({
      status: false,
      msg: "Сначала нужной войти в систему!",
      level: "danger"
    }) 
    return;
  }
  var email = req.body.email;
  var role = req.body.role;
  usersDB.findUserByEmail(email, function(err, user){
    if(err || !user) {
      res.json({
        status: false,
        msg: "Пользователь "+email+" не найден!",
        level: "danger"
      })
      return;
    }
    checkRoles(req.session.email, email, role, function(havePermission) {
      if(!havePermission)
      {
        res.json({
          status: false,
          msg: "Недостаточно прав для смены роли!",
          level: "danger"
        }) 
        return;
      }
      roles.assignRole(email, role, function(err) {
        if(err) {
          res.json({
            status: false,
            msg: "Ошибка добавления роли: "+err.message,
            level: "danger"
          })
          return;
        }
        res.json({
          status: true,
          msg: "Роль успешно добавлена!",
          level: "success"
        }) 
      })
    })
  });
});

function checkRoles(userEmail, targetEmail, targetRole, callback) {
  usersDB.findUserByEmail(userEmail, function(err, user) {
    if(err || !user) {
      callback(false);
      return;
    }
    if(user.isAdministrator) {
      callback(true);
      return;
    }
    roles.getRolesByEmail(userEmail, function(err, userRoles) {
      if(err) {
        callback(false);
        return;
      }
      if(!userRoles) {
        callback(targetRole=="student" && userEmail == targetEmail); 
        return;
      }
      if(roles.indexOf("teacher")>-1) {
        callback(targetRole=="teacher");
        return;
      }
      if(roles.indexOf("student")>-1) {
        callback(targetRole=="student" && userEmail == targetEmail); 
        return;
      }
    })
  });
}

module.exports = router;