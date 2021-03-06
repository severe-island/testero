"use strict"

const express = require('express')

/**
 * @typedef {Object} Settings
 * @property {mongodb.Db} mongoDBConnection
 * @param {Settings} settings
 */
module.exports = function(settings) {
  const router = express.Router()

  const db = require('../db')
  db.setup(settings)
  const lib = require('../lib/session')
  lib.setup(settings)

  router.get('/users/:id/auth', function(req, res) {
    return db.findUserById(req.params.id)
      .then(data => {
        if (!!data) {
          return lib.checkSession(req)
            .then(checkResult => {
              if (checkResult.status) {
                if (data.email === checkResult.user.email) {
                  res.json({
                    status: true,
                    level: 'success',
                    msg: 'The user is authorized.'
                  })
                }
                else {
                  res.json({
                    status: false,
                    level: 'warning',
                    msg: 'Authorization request is allowed only by the user.'
                  })
                }
              }
              else {
                res.json(checkResult);
              }
            })
        }
        else {
          res.json({
            status: false,
            level: 'info',
            msg: 'User is not found.'
          })
        }
      })
      .catch(err => {
        res.status(500)
        res.json({
          status: false,
          level: 'danger',
          msg:
            process.env.NODE_ENV !== 'production'
            ? 'Database error: "' + err.message + '".'
            : 'Internal server error.'
        })
      })
  })


  router.post('/users/:id/auth', function(req, res, next) {
    if (!req.params.id) { // TODO: It looks like it's a dead code.
      res.json({
        status: false,
        level: 'warning',
        msg: 'The user ID is not set.'
      })
      return
    }
    
    if (!req.body.password) {
      res.json({
        status: false,
        level: 'warning',
        msg: 'The user password is not set.'
      })
      return
    }
    
    let password = req.body.password
    let remember = !!req.body.remember

    return db.findUserById(req.params.id)
      .then(data => {
        if (!!data) {
          return db.findUserByEmail(data.email)
          .then(data => {
            if (!data) {
              res.json({
                msg: "User is not found.",
                status: false, 
                level: "info"
              })
              return
            }
    
            if (data.removed) {
              res.json({
                status: false,
                level: "info",
                msg: "Your account has been deleted."
              })
              return
            }
    
            if (data.password !== password) {
              res.json({
                msg: "Incorrect password.",
                status: false,
                level: "warning"
              })
              return
            }
    
            let msg = "You are authorized."
            if (!!remember) {
              msg += " I will try to remember you."
              req.session.cookie.originalMaxAge = 1000*60*60
            }
            else {
              req.session.cookie.originalMaxAge = null
              req.session.cookie.expires = false
            }
            req.session.login = true
            req.session.email = data.email
            req.session.user_id = data.id
            res.json({
              msg: msg,
              status: true,
              level: "success"
            })
          })
        }
        else {
          res.json({
            msg: "User is not found.",
            status: false, 
            level: "info"
          });
        }
      })
      .catch(err => {
        res.status(500)
        res.json({
          status: false,
          level: 'danger',
          msg:
            process.env.NODE_ENV !== 'production'
            ? 'Database error: "' + err.message + '".'
            : 'Internal server error.'
        })
      })
  })


  router.delete('/users/:id/auth', function(req, res, next) {
    return lib.checkSession(req)
      .then(checkResult => {
        if (checkResult.status) {
          req.session.login = false;
          let email = req.session.email;
          res.json({
            msg: "You have come out and now are no longer " + email + ".",
            status: true,
            level: "success"
          });
        }
        else {
          checkResult.status = true;
          res.json(checkResult);
        }
      })
      .catch(err => {
        res.status(500)
        res.json({
          status: false,
          level: 'danger',
          msg:
            process.env.NODE_ENV !== 'production'
            ? 'Database error: "' + err.message + '".'
            : 'Internal server error.'
        })
      })
  })

  return router
}
