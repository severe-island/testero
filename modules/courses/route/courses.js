var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');
var usersDB = require('../../users/db');

router.post('/findAllCourses', function(req, res, next) {
  db.findAllCourses(function(err, courses) {
    if(err) {
      res.json({ 
        status: false,
        msg: err.msg
      })
      return;
    }
    if(data.courses.length === 0) {
      status: true,
      msg: "Ещё не добавлено ни одного курса.",
      courses: courses
      return;
    }
    res.json({ 
      status: true,
      msg: "Успешно получен массив курсов!",
      courses: courses
    })
  });
});

router.post('/findCourseById', function(req, res, next) {
  db.findCourse({ _id: req.body.id }, function(err, course) {
    if(err || !course) {
      res.json({
        status: true,
        msg: "Курс не был найден."
      })
    }
    else {
      res.json({
        status: true,
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
        status: false,
        msg: "Курс не был найден."
      })
    }
    else {
      res.json({
        status: true,
        msg: "Курс был успешно найден!",
        course: course
      })
    }
  });
});

router.post('/addCourse', function(req, res, next) {
  if(!req.session.login)
  {
    res.json({
      status: false,
      msg: "Вы должны зайти в систему!"
    })
    return;
  }
  if(!req.body.title)
  {
    res.json({
      status: false,
      msg: "Необходимо указать имя курса! (title)"
    })
    return;
  }
  if(req.body["i-am-author"])
  {
    usersDB.findUserByEmail(req.session.email, function(err, user){
      if(err || !user) {
        res.json({
          status: false,
          msg: "Вы должны зайти в систему!"
        })
        return;
      }
      db.addCourse(req.body.title, user.email, function(err) {
        if(err) {
          res.json({
            status: false,
            msg: err.msg
          })
          return;
        }
        else {
          res.json({
            status: true,
            msg: "Курс был успешно добавлен!"
          })
        }
      });
    })
  }
  else
  {
    db.addCourse(req.body.title, undefined, function(err) {
      if(err) {
        res.json({
          status: false,
          msg: err.msg
        })
      }
      else {
        res.json({
          status: true,
          msg: "Курс был успешно добавлен!"
        })
      }
    });
  } 
});

router.post('/updateCourse', function(req, res, next) {
  db.updateCourse(req.body.course, function(err) {
    if(err) {
      res.json({
        status: false,
        msg: err.msg
      })
    }
    else {
      res.json({
        status: true,
        msg: "Курс был успешно обновлён!"
      })
    }
  });
});

module.exports = router;