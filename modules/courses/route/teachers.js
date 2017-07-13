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

    router.get('/teachers', function(req, res, next) {
        res.json({
            status: true,
            msg: "Список преподавателей загружен.",
            level: 'success',
            teachers: []
        });
    });

    return router
}
