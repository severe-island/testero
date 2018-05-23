"use strict"

const express = require('express')

const coursesDB = require('../db/courses')
const rolesDB = require('../db/roles')
const usersDB = require('../../users/db')
const sessions = require('../../users/lib/session')

module.exports = function(connection) {
  const router = express.Router()

  coursesDB.setup(connection)  
  rolesDB.setup(connection)
  usersDB.setup(connection)
  sessions.setup(connection)

  router.post('/courses/:id/subjects', function(req, res, next) {
    return sessions.checkSession(req)
      .then(checkResult => {
        if (!checkResult.status) {
          res.json(checkResult);
          return;
        }
        
        if (!req.params.id) {
          res.json({
            status: false,
            level: "danger",
            msg: "Не задан ID курса."
          });
          return;
        }
        
        if (!req.body.title) {
          res.json({
            status: false,
            level: "danger",
            msg: "Не задано название темы."
          });
          return;
        }
        
        return usersDB.findUserByEmail(req.session.email)
          .then(user => {
            if (!user) {
              res.json({
                status: false,
                level: "danger",
                msg: "Вы не найдены в базе данных."
              });
              return;
            }
            
            rolesDB.getRolesByEmail(req.session.email, function(err, roles) {
              if (err) {
                res.json({
                  status: false,
                  level: "danger",
                  msg:
                    process.env.NODE_ENV !== 'production'
                    ? 'Ошибка базы данных: "' + err.message + '".'
                    : 'Внутренняя ошибка сервера.'
                });
                return;
              }
              
              if (!roles || roles.indexOf("teacher")) {
                res.json({
                  status: false,
                  level: "danger",
                  msg: "Для добавления темы Вы должны быть преподавателем."
                });
                return;
              }
              
              coursesDB.findCourseById(req.params.id, function(err, course) {
                if (err) {
                  res.json({
                    status: false,
                    level: "danger",
                    msg:
                      process.env.NODE_ENV !== 'production'
                      ? 'Ошибка базы данных: "' + err.message + '".'
                      : 'Внутренняя ошибка сервера.'
                  });
                  return;
                }
                
                if (!course) {
                  res.json({
                    status: false,
                    level: "danger",
                    msg: "Курс не найден."
                  });
                  return;
                }
                
                if (course.authors.indexOf(req.session.email) < 0) {
                  res.json({
                    status: false,
                    level: "danger",
                    msg: "Добавлять темы могут только авторы курса."
                  });
                  return;
                }
                
                var subject = {title: req.body.title, course_id: req.params.id};
                coursesDB.addSubject(subject , function(err, subject) {
                  if (err) {
                    res.json({
                      status: false,
                      level: "danger",
                      msg:
                        process.env.NODE_ENV !== 'production'
                        ? 'Ошибка базы данных: "' + err.message + '".'
                        : 'Внутренняя ошибка сервера.'
                    });
                    return;
                  }
                  
                  res.json({
                    status: true,
                    level: "success",
                    msg: "Тема добавлена.",
                    subject: subject
                  });
                });
              });
            });
        });
    });
  });

  return router
}
