var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');
var lib = require('../lib/session');

router.get('/users/:id\/auth', function(req, res) {
  lib.checkSession(req, function(checkResult) {
    if (checkResult.status) {
      res.json({
        status: true,
        level: 'success',
        msg: 'Пользователь авторизован.'
      });
    }
    else {
      res.json(checkResult);
    }
  });
});


router.post('/users/:id/auth', function(req, res, next) {
  lib.checkSession(req, function(checkResult) {
    if (checkResult.status && req.session.email === req.body.email) {
      res.json({
        msg: "Вы уже авторизованы.",
        status: true,
        level: "info"
      });
      return;
    }
    
    var email = req.body.email;
    var password = req.body.password;
    var remember = (req.body.remember !== undefined);
    db.findUserByEmail(email, function(err, data){
      if (err || !data) {
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
      req.session.email = email;
      //delete data.password;
      req.session.user_id = data._id;
      res.json({
        msg: msg,
        status: true,
        level: "success"
      });
    });
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

module.exports = router;
