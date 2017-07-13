"use strict"

const express = require('express')

module.exports = function(connection) {
  const router = express.Router()

  const db = require('../db')
  db.setup(connection)
  const lib = require('../lib/session')
  lib.setup(connection)

  router.post('/setAsAdministrator', function(req, res, next) {
    if(!req.session.login) {
      res.json({
        msg: "Сначала войдите в систему!",
        status: false,
        level: "danger"
      })
      return;
    }
    if(!req.body.email) {
      res.json({
        msg: "Укажите email!",
        status: false,
        level: "danger"
      })
      return;
    }
    var email = req.body.email;
    db.findUserByEmail(req.session.email, function(err, user) {
      if(err) {
        res.json({
          msg: "Ошибка бд: "+err.message,
          status: false,
          level: "danger"
        })
        return;
      }
      if(!user) {
        res.json({
          msg: "Сначала войдите в систему!",
          status: false,
          level: "danger"
        })
        return;
      }
      if(!user.isAdministrator) {
        res.json({
          msg: "Только администратор может назначить администратора!",
          status: false,
          level: "danger"
        })
        return;
      }
      db.setAsAdministrator(email, function(err) {
        if(err) {
          res.json({
            msg: "Ошибка бд: "+err.message,
            status: false,
            level: "danger"
          })
          return;
        }
        res.json({
          msg: "Теперь "+email+" администратор!",
          status: true,
          level: "access"
        })
      })
    })
  })

  return router
}
