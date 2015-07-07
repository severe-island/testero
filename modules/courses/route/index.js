var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.get('/findAllCourses', function(req, res, next) {
  res.json({
      msg: "Всё OK!",
      status: true,
      level: "info",
      courses: []
    });
    return;
});

module.exports = router;
