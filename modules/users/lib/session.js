"use strict"

const express = require('express')
const mongodb = require('mongodb')

const db = require('../db')

/**
 * @typedef {Object} Settings
 * @property {mongodb.Db} mongoDBConnection
 * @param {Settings} settings
 */
module.exports.setup = function(settings) {
  db.setup({mongoDBConnection: settings.mongoDBConnection})
}


/**
 * @param {express.Request} req 
 */
module.exports.checkSession = function (req) {
  if (!req.session.login || !req.session.email) {
    let checkResult = {
      status: false,
      level: 'info',
      msg: 'You are not authorized.'
    }

    return Promise.resolve(checkResult)
  }

  return db.findUserByEmail(req.session.email)
    .then(data => {
      if (!data) {
        req.session.login = false;
        
        let checkResult = {
          status: false,
          level: "danger",
          msg:
            "Your session was not found."
            + " There may be an error with the session or the database."
            + " Please log in again."
        }

        return checkResult
      }
      
      if (data.removed) {
        req.session.login = false;
        
        let checkResult = {
          msg: "Your account " + data.email + " was removed. The session will be broken.",
          status: false,
          level: "danger"
        }

        return checkResult
      }
      
      let checkResult = {
        status: true,
        level: "success",
        msg: 'The user is authorized.',
        user: data
      }

      return checkResult
    })
    .catch(err => {
        let checkResult = {
          status: false,
          level: "danger",
          msg:
            process.env.NODE_ENV !== 'production'
            ? 'Database error: "' + err.message + '".'
            : 'Internal server error.'
        }
        return checkResult
    })
}
