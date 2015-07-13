var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.get('/users/:id\/auth', function(req, res) {
  checkSession(req, checkSessionResult, function(authorized, user) {
    if (authorized) {
      res.json({
        status: true,
        level: 'success',
        msg: 'Пользователь авторизован.'
      });
    }
    else {
      res.json({
        status: false,
        level: 'info',
        msg: 'Пользователь не авторизован.'
      });
    }
  });
});


module.exports = router;
