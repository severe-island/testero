"use strict"

const mongodb = require('mongodb')

/** @type {mongodb.Collection<any>} */
let collection

const usersDB = require('../../users/db')

/**
 * @typedef {Object} Settings
 * @property {mongodb.Db} settings.mongoDBConnection
 * @param {Settings} settings
 */
module.exports.setup = function(settings) {
  collection = settings.mongoDBConnection.collection('roles')
  usersDB.setup(settings)
}

/**
 * @param {string} userId
 * @param {string} role
 */
exports.assignRole = function(userId, role) {
  var date = new Date();
  return collection.findOne({user_id: userId, created_at: {$exists: true}})
    .then(foundedRoles => {
      if (foundedRoles) {
        return collection.updateOne(
          { user_id: userId },
          { $addToSet: { roles: role }, $set: { updated_at: date } },
          { upsert: true })
      }
      else {
        return collection.insertOne(
          {user_id: userId, roles: [role], created_at: date})
      }
  })
}

/** @param {string} userId */
exports.getRolesByUserId = function(userId) {
  return collection.findOne({ user_id: userId })
    .then(result => {
      if (result) {
        return result.roles
      }
      else {
        return []
      }
  })
}

/** @param {string} email */
exports.getRolesByEmail = function(email) {
  return usersDB.findUserByEmail(email)
    .then(user => {
      return collection.findOne({ user_id: user.id })
        .then(result => {
          if (result) {
            return result.roles
          }
          else {
            return []
          }
        })
    })
}

/**
 * 
 * @param {string} role 
 * @returns {Promise<string[]>}
 */
exports.findUsersByRole = function(role) {
  return collection.find().toArray()
    .then(records => {
      let users = []
      records.forEach(item => {
        if (item.roles.indexOf(role) >= 0) {
          users.push(item.user_id.toString())
        }
      })
      return users
    })
}

exports.clearRoles = function() {
  return collection.deleteMany({ })
}
