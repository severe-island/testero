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


module.exports = router;
