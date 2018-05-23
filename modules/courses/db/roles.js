"use strict"

const mongodb = require('mongodb')

/** @type {mongodb.Collection<any>} */
let collection

/** @param {mongodb.Db} db */
module.exports.setup = function(db) {
  collection = db.collection('roles')
}


exports.assignRole = function(email, role, callback) {
  var date = new Date();
  collection.findOne({email: email, created_at: {$exists: true}}, function (err, findedUser){
    if (err) {
      callback(err)
    }
    else if (findedUser)
    {
      collection.update({ email: email },
                        { $addToSet: { roles: role }, $set: { updated_at: date } },
                        { upsert: true },
                        callback);
    }
    else {
      collection.insert({email: email, roles: [role], created_at: date, update_at: date}, callback);
    }
  })
}


exports.getRolesByEmail = function(email, callback) {
  collection.findOne({ email: email }, function (err, userRoles) {
    if(userRoles)
    {
      callback(err, userRoles.roles);
    }
    else
    {
      callback(err, null);
    }
  })
}

exports.clearRoles = function() {
  return collection.deleteMany({ })
}
