var express = require('express');
var router = express.Router();
var roles = require('../db/roles');
var conf = require('../../../config');
var usersDB = require('../../users/db');

router.post('/assignRole', function(req, res, next) {
  var email = req.body.email;
  var role = req.body.role;
  usersDB.findUserByEmail(email, function(err, user){
    if(err || !user) {
      res.json({
        status: false,
        msg: "Пользователь "+email+" не найден!"
      })
      return;
    }
    roles.assignRole(email, role, function(err) {
      if(err) {
        res.json({
          status: false,
          msg: "Ошибка добавления роли: "+err
        })
        return;
      }
      res.json({
        status: true,
        msg: "Роль успешно добавлена!"
      })
    })
  });
});

module.exports = router;