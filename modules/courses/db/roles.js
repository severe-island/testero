"use strict"

const mongodb = require('mongodb')

/** @type {mongodb.Collection<any>} */
let collection

const usersDB = require('../../users/db')

/** @param {mongodb.Db} db */
module.exports.setup = function(db) {
  collection = db.collection('roles')
  usersDB.setup(db)
}

/**
 * @param {string} userId
 * @param {string} role
 */
exports.assignRole = function(userId, role) {
  var date = new Date();
  return collection.findOne({userId: userId, created_at: {$exists: true}})
    .then(foundedRoles => {
      if (foundedRoles) {
        return collection.updateOne(
          { userId: userId },
          { $addToSet: { roles: role }, $set: { updated_at: date } },
          { upsert: true })
      }
      else {
        return collection.insertOne(
          {userId: userId, roles: [role], created_at: date, update_at: date})
      }
  })
}

/** @param {string} userId */
exports.getRolesByUserId = function(userId) {
  return collection.findOne({ userId: userId })
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
      return collection.findOne({ userId: user.id })
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


exports.clearRoles = function() {
  return collection.deleteMany({ })
}
