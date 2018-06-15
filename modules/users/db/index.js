"use strict"

const mongodb = require('mongodb')

/** @type {mongodb.Collection<any>} */
let collection

/** @param {mongodb.Db} db */

module.exports.setup = function(db) {
  collection = db.collection('users')
}

module.exports.findAllUsersWithoutPassword = function (admin) {
  if (admin) {
    return collection.find({ }, { password: 0 }).toArray()
  }
  else {
    return collection.find({ $or: [ {removed: { $exists: false } }, { not: { removed: true } } ] }, 
      { password: 0, isAdministrator : 0, editor: 0 })
      .toArray()
      .then(users => {
        for (var i = 0; i < users.length; i++) {
          if (!users[i].showEmail) {
            delete users[i].email
          }
        }
        return users
      })
  }
}

module.exports.findUserByEmailWithoutPassword = function (userEmail, admin) {
  if (admin) {
    return collection.findOne({ email: userEmail }, { projection: { password: 0 } })
  }
  else {
    return collection.findOne({$and: [ { email: userEmail },
      { $or: [ { removed: { $exists: false } }, { not: { removed: true } } ]} ]}, 
      { projection: { password: 0, isAdministrator : 0, editor: 0 } })
      .then(user => {
        if (!!user && !user.showEmail) {
          delete user.email;
        }
        return user
      })
  }
};


module.exports.findUserByIdWithoutPassword = function(id, admin) {
  if (admin) {
    return collection.findOne(
      { _id: new mongodb.ObjectID(id) },
      { projection: { password: 0 } })
  }
  else {
    return collection.findOne(
      { $and: [
          { _id: new mongodb.ObjectID(id) },
          {$or: [
            {removed: { $exists: false } },
            { not: { removed: true } } ]} ] },
      { projection: { password: 0, isAdministrator : 0, editor: 0 } })
      .then(foundUser => {
        if (!!foundUser && !foundUser.showEmail) {
          delete foundUser.email;
        }
        return foundUser
      });
  }
};


module.exports.findUserById = function (userId) {
  return collection.findOne({ _id: new mongodb.ObjectID(userId) })
}


function findUserByEmail(userEmail) {
  return collection.findOne({ email: userEmail })
}

module.exports.findUserByEmail = findUserByEmail


module.exports.isAdminExists = function (callback) {
  collection.findOne({isAdministrator: true}, function (err, adminUser)
  {
    if (!err && adminUser)
    {
      callback(true);
    }
    else
    {
      callback(false);
    }
  });
}


module.exports.registerUser = function(userData) {
  return findUserByEmail(userData.email)
    .then(user => {
      if (user) {
        throw new Error('Unable register user. User already exist')
      }
      return collection.insertOne({
        email: userData.email,
        password: userData.password,
        isAdministrator: userData.isAdministrator,
        showEmail: userData.showEmail || false,
        created_at: new Date(),
        updated_at: null,
        registeredBy: userData.registeredBy
      })
    })
    .then(result => {
      return result.ops[0]
    })
}

module.exports.removeUser = function(email) {
  let date = new Date()

  return collection.updateOne({ email: email }, { $set: {removed: true, updated_at: date} }) 
}

module.exports.setAsAdministrator = function(email, editor) {
  let date = new Date();

  return collection.updateOne(
    { email: email },
    { $set: { editor: editor, isAdministrator: true, updated_at: date } }) 
}

module.exports.updateUser = function(email, updater, editor) {
  updater.editor = editor;
  updater.updated_at = new Date();

  return collection.updateOne({ email: email }, { $set: updater });
}

module.exports.clearUsers = function() {
  return collection.deleteMany({ })
}
