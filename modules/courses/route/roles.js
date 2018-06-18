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

  router.post('/assignRole', function(req, res) {
    return sessions.checkSession(req)
      .then(checkResult => {  
        if (!checkResult.status) {
          res.json({
            status: false,
            msg: "Сначала нужной войти в систему!",
            level: "danger"
          })
          return;
        }

        let targetUserId = req.body.user_id;
        let role = req.body.role;

        return usersDB.findUserById(targetUserId)
          .then(user => {
            if (!user) {
              res.json({
                status: false,
                msg: "The users with id '" + targetUserId + "' is not found",
                level: "danger"
              })
              return;
            }

            return checkRoles(checkResult.user.id, targetUserId, role)
              .then(havePermission => {
                if (!havePermission) {
                  res.json({
                    status: false,
                    msg: "Недостаточно прав для смены роли!",
                    level: "danger"
                  })
                  return;
                }

                return rolesDB.assignRole(targetUserId, role)
                  .then(result => {
                    res.json({
                      status: true,
                      msg: "Роль успешно добавлена!",
                      level: "success"
                    })
                  })
              })
          })
      })
    })

  function checkRoles(userId, targetUserId, targetRole) {
    return usersDB.findUserById(userId)
      .then(user => {
        if (!user) {
          return false;
        }

        if (user.isAdministrator) {
          return true;
        }

        return rolesDB.getRolesByUserId(userId)
          .then(userRoles => {
            if (userRoles.length == 0) {
              return targetRole == "student" && userId.toString() == targetUserId.toString()
            }

            if (userRoles.indexOf("teacher") > -1) {
              return targetRole == "teacher"
            }

            if (userRoles.indexOf("student") > -1) {
              return targetRole == "student" && userId.toString() == targetUserId.toString()
            }
          })
      })
  }

  router.get('/roles/', function(req, res) {
    let email = req.query['email']
    let userId = req.query['user_id']
    let role = req.query['role']
    
    if (email) {
      rolesDB.getRolesByEmail(email)
        .then(userRoles => {
          res.json({
            status: true,
            level: 'success',
            msg: "Роли успешно получены",
            roles: userRoles
          });
        });
      return
    }
    
    if (userId) {
      rolesDB.getRolesByUserId(userId)
        .then(userRoles => {
          res.json({
            status: true,
            level: 'success',
            msg: "Роли успешно получены",
            roles: userRoles
          });
        });
      return
    }

    if (role) {
      rolesDB.findUsersByRole(role)
        .then(users => {
          res.json({
            status: true,
            level: 'success',
            msg: 'Список пользователей с указанной ролью успешно получен',
            users: users
          })
        })
      return
    }

    res.json({
      status: false,
      level: 'warning',
      msg: 'Неизвестный параметр запроса'
    })
  });

  return router
}
