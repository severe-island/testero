var express = require('express');
var router = express.Router();
var db = require('../db/courses');
var rolesDB = require('../db/roles');
var conf = require('../../../config');
var usersDB = require('../../users/db');

router.get('/courses', function(req, res, next) {
  db.findAllCourses(function(err, courses) {
    if (err) {
      res.json({ 
        status: false,
        msg:
          conf.mode !== 'production' 
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

router.get('/findCourseById', function(req, res, next) {
  db.findCourse({ _id: req.body.id }, function(err, course) {
    if (err) {
      res.json({
        status: false,
        msg: err.msg,
        level: "danger"
      });
      return;
    }
    else if(!course) {
      res.json({
        status: true,
        msg: "Курс не был найден.",
        level: "warning"
      });
    }
    else {
      res.json({
        status: true,
        msg: "Курс был успешно найден.",
        level: "info",
        course: course
      });
    }
  });
});

router.get('/findCourseByTitle', function(req, res, next) {
  db.findCourse({ title: req.body.title }, function(err, course) {
    if (err) {
      res.json({
        status: false,
        msg: err.msg,
        level: "danger"
      });
      return;
    }
    else if(!course) {
      res.json({
        status: false,
        msg: "Курс не был найден.",
        level: "warning"
      });
    }
    else {
      res.json({
        status: true,
        msg: "Курс был успешно найден.",
        level: "info",
        course: course
      });
    }
  });
});

router.post('/addCourse', function(req, res, next) {
  if(!req.session.login)
  {
    res.json({
      status: false,
      msg: "Вы должны зайти в систему!",
      level: "danger"
    })
    return;
  }
  if(!req.body.title)
  {
    res.json({
      status: false,
      msg: "Необходимо указать имя курса! (title)",
      level: "danger"
    })
    return;
  }
  rolesDB.getRolesByEmail(req.session.email, function(err, userRoles) {
    if(!userRoles || userRoles.indexOf("teacher")<0) {
      res.json({
        status: false,
        msg: "Вы должны быть teacher!",
        level: "danger"
      })
      return;
    }
    if(req.body["i-am-author"])
    {
      usersDB.findUserByEmail(req.session.email, function(err, user){
        if(err || !user) {
          res.json({
            status: false,
            msg: "Вы должны зайти в систему!",
            level: "danger"
          })
          return;
        }
        db.addCourse(req.body.title, user.email, function(err) {
          if(err) {
            res.json({
              status: false,
              msg: err.msg,
              level: "danger"
            })
            return;
          }
          else {
            res.json({
              status: true,
              msg: "Курс был успешно добавлен!",
              level: "success"
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
            msg: err.msg,
            level: "danger"
          })
        }
        else {
          res.json({
            status: true,
            msg: "Курс был успешно добавлен!",
            level: "success"
          })
        }
      });
    } 
  })
});

/*
router.post('/updateCourse', function(req, res, next) {
  db.updateCourse(req.body.course, function(err) {
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

router.post('/addSubject', function(req, res, next) {
  if(!req.session.login) {
    res.json({
      status: false,
      level: "danger",
      msg: "Только зарегистрированные польователи могут добавлять темы!"
    });
    return;
  }
  if(!req.body.subjectTitle) {
    res.json({
      status: false,
      level: "danger",
      msg: "Необходимо указать имя темы! (subjectTitle)"
    });
    return;
  }
  if(!req.body.courseId) {
    res.json({
      status: false,
      level: "danger",
      msg: "Необходимо указать id курса! (courseId)"
    });
    return;
  }
  usersDB.findUserByEmail(req.session.email, function(err, user) {
    if(err) {
      res.json({
        status: false,
        level: "danger",
        msg: "Ошибка БД: " + err.message
      });
      return;
    }
    if(!user) {
      res.json({
        status: false,
        level: "danger",
        msg: "Вы не найдены в БД! Возможно, ошибка с сессией."
      });
      return;
    }
    rolesDB.getRolesByEmail(req.session.email, function(err, roles) {
      if(err) {
        res.json({
          status: false,
          level: "danger",
          msg: "Ошибка БД: " + err.message
        });
        return;
      }
      if(!roles || roles.indexOf("teacher") < 0 && !user.isAdministrator) {
        res.json({
          status: false,
          level: "danger",
          msg: "Вы должны быть преподавателем или администратором для добавления темы!"
        });
        return;
      }
      db.findCourse({ _id: req.body.courseId }, function(err, course) {
        if(err) {
          res.json({
            status: false,
            level: "danger",
            msg: "Ошибка БД: " + err.message
          });
          return;
        }
        if(!course) {
          res.json({
            status: false,
            level: "danger",
            msg: "Курс с таким id не найден!"
          });
          return;
        }
        if(course.authors.indexOf(req.session.email) < 0 && !user.isAdministrator) {
          res.json({
            status: false,
            level: "danger",
            msg: "Курс могут редактировать только его авторы или администратор!"
          });
          return;
        }
        db.addSubject(req.body.courseId, req.body.subjectTitle, function(err) {
          if(err) {
            res.json({
              status: false,
              level: "danger",
              msg: "Ошибка БД: " + err.message
            });
            return;
          }
          res.json({
            status: true,
            level: "success",
            msg: "Тема удачно добавлена!"
          });
        });
      });
    });
  });
});

module.exports = router;