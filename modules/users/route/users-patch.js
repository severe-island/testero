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
  
  router.patch('/users/:id', function(req, res) {
    lib.checkSession(req)
    .then(checkResult => {
      if (!checkResult.status) {
        res.json({
          status: false,
          level: "danger",
          msg: "Функция доступна только зарегистрированным пользователям."
        })

        return
      }

      return db.findUserById(req.params.id)
        .then(targetUser => {
          if (!targetUser) {
            res.json({
              status: false,
              level: "danger",
              msg: "User is not found."
            })

            return;
          }

          let updater = { }
    
          if (req.body.name) {
            updater.name = req.body.name;
          }
          
          if (req.body.familyName) {
            updater.familyName = req.body.familyName;
          }
          
          if (req.body.patronymic) {
            updater.patronymic = req.body.patronymic;
          }
          
          if (req.body.showEmail !== undefined) {
            updater.showEmail = req.body.showEmail;
          }
    
          if (!checkResult.user.isAdministrator && checkResult.user.email != targetUser.email) {
            res.json({
              status: false,
              level: "danger",
              msg: "Только администратор может обновить чужой профиль!"
            })

            return;
          }

          if (req.body.password) {
            if (!req.body.passwordDuplicate) {
              res.json({
                status: false,
                level: "danger",
                msg: "Нужно передать также passwordDuplicate!"
              });
              return;
            }

            if (!req.body.oldPassword) {
              res.json({
                status: false,
                level: "danger",
                msg: "Для смены пароля нужно подтвердить старый пароль! (oldPassword)"
              });
              return;
            }

            if (req.body.password != req.body.passwordDuplicate) {
              res.json({
                status: false,
                level: "danger",
                msg: "Новый пароль и его подтверждение не совпадают!"
              });
              return;
            }

            updater.password = req.body.password;

            if(updater.password && req.body.oldPassword != targetUser.password) {
              res.json({
                status: false,
                level: "danger",
                msg: "Неверный пароль!"
              });
              return;
            }
          }

          db.updateUser(targetUser.email, updater, checkResult.user.email)
          .then(result => {
            res.json({
              status: true,
              level: "success",
              msg: "Профиль успешно обновлён!: "
            });
          })
        })
    })
  })

  return router;
}
