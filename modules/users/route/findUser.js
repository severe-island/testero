var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.post('/findAllUsers', function(req, res, next) {
  if(!req.session.login) {
    findAllUsers(false, res);
    return;
  }
  db.findUserByEmail(req.session.email, function(err, user) {
    if(err || !user || !user.isAdministrator) {
      findAllUsers(false, res);
      return;
    } else {
      findAllUsers(true, res);
      return;
    }
  })
});

function findAllUsers(admin, res) {
  db.findAllUsersWithoutPassword(admin, function(err, users) {
    if(err) {
      res.json({
        status: false,
        level: "danger",
        msg: "Ошибка БД: " + err.message
      })
      return;
    }
    res.json({
      status: true,
      level: "info",
      msg: "Список пользователей получен!: ",
      users: users
    })
  })
}
  
router.post('/findUserByEmail', function(req, res, next) {
  if(!req.body.email) {
    res.json({
      status: false,
      level: "danger",
      msg: "Укажите email!"
    })
    return;
  }
  if(!req.session.login) {
    findUserByEmail(req.body.email, false, res);
    return;
  }
  db.findUserByEmail(req.session.email, function(err, user) {
    if(err || !user || !user.isAdministrator) {
      findUserByEmail(req.body.email, false, res);
      return;
    } else {
      findUserByEmail(req.body.email, true, res);
      return;
    }
  })
});

function findUserByEmail(email, admin, res) {
  db.findUserByEmailWithoutPassword(email, admin, function(err, user) {
    if(err) {
      res.json({
        status: false,
        level: "danger",
        msg: "Ошибка БД: " + err.message
      })
      return;
    }   
    if(!user) {
      res.json({
        status: false,
        level: "info",
        msg: "Пользователь не найден"
      })
      return;
    }
    res.json({
      status: true,
      level: "info",
      msg: "Пользователь найден!: ",
      user: user
    })
  })
}

router.post('/findUserById', function(req, res, next) {
  if(!req.body.id) {
    res.json({
      status: false,
      level: "danger",
      msg: "Укажите Id!"
    })
    return;
  }
  if(!req.session.login) {
    findUserById(req.body.id, false, res);
    return;
  }
  db.findUserById(req.session.id, function(err, user) {
    if(err || !user || !user.isAdministrator) {
      findUserById(req.body.id, false, res);
      return;
    } else {
      findUserById(req.body.id, true, res);
      return;
    }
  })
});

function findUserById(id, admin, res) {
  db.findUserByIdWithoutPassword(id, admin, function(err, user) {
    if(err) {
      res.json({
        status: false,
        level: "danger",
        msg: "Ошибка БД: " + err.message
      })
      return;
    }   
    if(!user) {
      res.json({
        status: false,
        level: "info",
        msg: "Пользователь не найден"
      })
      return;
    }
    res.json({
      status: true,
      level: "info",
      msg: "Пользователь найден!: ",
      user: user
    })
  })
}



module.exports = router;
 