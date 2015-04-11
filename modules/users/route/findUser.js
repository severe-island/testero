var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.post('/findAllUsers', function(req, res, next) {
  db.findAllUsersWithoutPassword(function(err, users) {
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
});

router.post('/findUserByEmail', function(req, res, next) {
  if(!req.body.email) {
    res.json({
      status: false,
      level: "danger",
      msg: "Укажите email!"
    })
    return;
  }
  db.findUserByEmailWithoutPassword(req.body.email, function(err, user) {
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
});

router.post('/findUserById', function(req, res, next) {
  if(!req.body.id) {
    res.json({
      status: false,
      level: "danger",
      msg: "Укажите id!"
    })
    return;
  }
  db.findUserByIdWithoutPassword(req.body.id, function(err, user) {
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
});

module.exports = router;
 