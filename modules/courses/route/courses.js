"use strict"

const express = require('express')

module.exports = function(connection) {
  const router = express.Router()

  const coursesDB = require('../db/courses')
  coursesDB.setup(connection)
  const rolesDB = require('../db/roles')
  rolesDB.setup(connection)
  const usersDB = require('../../users/db')
  usersDB.setup(connection)
  const sessions = require('../../users/lib/session')
  sessions.setup(connection)

  router.get('/courses', function(req, res, next) {
    if (!!req.query['title']) { // by title
      coursesDB.findCourses({ title: req.query['title'] }, function(err, courses) {
        if (err) {
          res.json({
            status: false,
            msg: 
              process.env.NODE_ENV !== 'production'
              ? 'Ошибка базы данных: "' + err.msg + '".'
              : 'Внутренняя ошибка сервера.',
            level: "danger"
          });
        }
        else if(!(!!courses && courses.length !== 0)) {
          res.json({
            status: false,
            msg: "Курсы не были найдены.",
            level: "info"
          });
        }
        else {
          res.json({
            status: true,
            msg: "Курсы успешно найдены.",
            level: "success",
            courses: courses
          });
        }
      });
      return;
    }
    
    // all:
    
    coursesDB.findAllCourses(function(err, courses) {
      if (err) {
        res.json({ 
          status: false,
          msg:
            process.env.NODE_ENV !== 'production' 
            ? 'Ошибка базы данных: "' + err.msg + '".'
            : 'Внутренняя ошибка сервера',
          level: "danger"
        });
        return;
      }
      
      if (courses.length === 0) {
        res.json({ 
          status: true,
          msg: "Ещё не зарегистрировано ни одного курса.",
          level: "info",
          courses: courses
        });
        return;
      }
      
      res.json({ 
        status: true,
        msg: "Успешно получен список всех курсов.",
        level: "success",
        courses: courses
      });
    });
  });


  router.get('/courses/:id', function(req, res, next) {
    coursesDB.findCourseById(req.params.id, function(err, course) {
      if (err) {
        res.json({
          status: false,
          msg:
            process.env.NODE_ENV !== 'production'
            ? 'Ошибка базы данных: "' + err.msg + '".'
            : 'Внутренняя ошибка сервера',
          level: "danger"
        });
        return;
      }
      else if (!course) {
        res.json({
          status: false,
          msg: "Курс не был найден.",
          level: "info"
        });
      }
      else {
        res.json({
          status: true,
          msg: "Курс успешно найден.",
          level: "success",
          course: course
        });
      }
    });
  });


  router.post('/courses', function(req, res, next) {
    sessions.checkSession(req, function(checkResult){
      if (!checkResult.status) {
        res.json(checkResult);
        return;
      }
      
      if(!req.body.title) {
        res.json({
          status: false,
          msg: "Необходимо указать название курса.",
          level: "danger"
        });
        return;
      }
      
      rolesDB.getRolesByEmail(req.session.email, function(err, userRoles) {
        if (!userRoles || userRoles.indexOf("teacher") < 0) {
          res.json({
            status: false,
            msg: "Вы должны быть преподавателем.",
            level: "danger"
          });
          return;
        }
        
        var author = !!req.body["i-am-author"] ? req.session.email : undefined;
        coursesDB.add({title: req.body.title, author: author}, function(err, course) {
          if (err) {
            res.json({
              status: false,
              msg:
                process.env.NODE_ENV !== 'production'
                ? 'Ошибка базы данных: "' + err.msg + '".'
                : 'Внутренняя ошибка сервера.',
              level: "danger"
            });
          }
          else {
            res.json({
              status: true,
              msg: "Курс успешно добавлен",
              level: "success",
              course: course
            });
          }
        });
      });
    });
  });

  /*
  router.post('/updateCourse', function(req, res, next) {
    coursesDB.updateCourse(req.body.course, function(err) {
      if(err) {
        res.json({
          status: false,
          msg: err.msg,
          level: "danger"
        })
      }
      else {
        res.json({
          status: true,
          msg: "Курс был успешно обновлён!",
          level: "success"
        })
      }
    });
  });
  */


  return router
}
