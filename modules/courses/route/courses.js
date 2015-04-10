var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.post('/findAllCourses', function(req, res, next) {
  db.findAllCourses(function(err, courses) {
    if(err) {
      res.json({ 
        status: 0,
        msg: err.msg
      })
      return;
    }
    res.json({ 
      status: 1,
      msg: "Успешно получен массив курсов!",
      courses: courses
    })
  });
});

router.post('/findCourseById', function(req, res, next) {
  db.findCourse({ _id: req.body.id }, function(err, course) {
    if(err || !course) {
      res.json({
        status: 0,
        msg: "Курс не был найден."
      })
    }
    else {
      res.json({
        status: 1,
        msg: "Курс был успешно найден!",
        course: course
      })
    }
  });
});

router.post('/findCourseByTitle', function(req, res, next) {
  db.findCourse({ title: req.body.title }, function(err, course) {
    if(err || !course) {
      res.json({
        status: 0,
        msg: "Курс не был найден."
      })
    }
    else {
      res.json({
        status: 1,
        msg: "Курс был успешно найден!",
        course: course
      })
    }
  });
});

router.post('/addCourse', function(req, res, next) {
  db.addCourse(req.body.course, function(err) {
    if(err) {
      res.json({
        status: 0,
        msg: err.msg
      })
    }
    else {
      res.json({
        status: 1,
        msg: "Курс был успешно добавлен!"
      })
    }
  });
});

router.post('/updateCourse', function(req, res, next) {
  db.updateCourse(req.body.course, function(err) {
    if(err) {
      res.json({
        status: 0,
        msg: err.msg
      })
    }
    else {
      res.json({
        status: 1,
        msg: "Курс был успешно обновлён!"
      })
    }
  });
});

module.exports = router;