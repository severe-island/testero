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

  router.get('/courses/:id/subjects', function(req, res) {
    const course_id = req.params.id
    return coursesDB.findById(course_id)
      .then((data) => {
        if (data) {
          const subjects = data.subjects || []
          res.json({
            status: true,
            level: 'success',
            msg: 'Темы курса получены.',
            subjects: subjects
          })
        }
        else {
          res.json({
            status: false,
            level: 'warning',
            msg: 'Курс не найден.'
          })
        }
      })
  })

  router.post('/courses/:id/subjects', function(req, res) {
    const course_id = req.params.id
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
        
        return usersDB.findUserByEmail(checkResult.user.email)
          .then(user => {
            if (!user) {
              res.json({
                status: false,
                level: "danger",
                msg: "Вы не найдены в базе данных."
              });
              return;
            }
            
            return rolesDB.getRolesByEmail(checkResult.user.email)
            .then(roles => {
              if (!roles || roles.indexOf("teacher")) {
                res.json({
                  status: false,
                  level: "danger",
                  msg: "Для добавления темы Вы должны быть преподавателем."
                });
                return;
              }
              
              return coursesDB.findById(course_id)
                .then(course => {
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
                  return coursesDB.addSubject(course_id, subject)
                    .then(subject => {
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
