var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

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
  
  db.findUserById(req.session.id, function(err, user) {
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
    
    res.json({
      status: true,
      level: "success",
      msg: "Пользователь найден.",
      user: user
    });
  });
}

module.exports = router;
