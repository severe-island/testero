"use strict"

const express = require('express')
const mongodb = require('mongodb')

const db = require('../db')

/**
 * @param {mongodb.Db} connection
 */
module.exports.setup = function(connection) {
  db.setup(connection)
}


/**
 * @param {express.Request} req 
 */
module.exports.checkSession = function (req, callback) {
  if (!req.session.login || !req.session.email) {
    let checkResult = {
      status: false,
      level: 'info',
      msg: 'You are not authorized.'
    };
    callback(checkResult);
    return;
  }

  db.findUserByEmail(req.session.email, function(err, data) {
    let checkResult
    if (err) {
      checkResult = {
        status: false,
        level: "danger",
        msg:
          process.env.NODE_ENV !== 'production'
          ? 'Database error: "' + err.message + '".'
          : 'Internal server error.'
      };
      callback(checkResult);
      return;
    }
    
    if (!data) {
      req.session.login = false;
      checkResult = {
        status: false,
        level: "danger",
        msg:
          "Your session was not found."
          + "There may be an error with the session or the database."
          + " Please log in again."
      };
      callback(checkResult);
      return;
    }
    
    if (data.removed) {
      req.session.login = false;
      checkResult = {
        msg: "Your account " + data.email + "was removed. The session will be broken.",
        status: false,
        level: "danger"
      };
      callback(checkResult);
      return;
    }
    
    checkResult = {
      status: true,
      level: "success",
      msg: 'The user is authorized.',
      user: data
    };
    callback(checkResult);
  });
};
