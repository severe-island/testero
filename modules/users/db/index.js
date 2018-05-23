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

module.exports.findUserByEmailWithoutPassword = function (userEmail, admin, callback) {
  if (admin) {
    collection.findOne({ email: userEmail }, 
    { password: 0 },
    function (err, findedUser) {
      callback(err, findedUser);
    }); 
  }
  else {
    collection.findOne({$and: [ { email: userEmail } , {$or: [ {removed: { $exists: false } }, { not: { removed: true } } ]} ]}, 
                       { password: 0, isAdministrator : 0, editor: 0 }, function (err, user) {
      if (!!user && !user.showEmail) {
        delete user.email;
      }
      callback(err, user);
    });
  }
};


module.exports.findUserByIdWithoutPassword = function(id, admin, callback) {
  if (admin) {
    collection.findOne(
      { _id: id },
      { password: 0 },
      function(err, foundUser) {
        callback(err, foundUser);
      }); 
  }
  else {
    collection.findOne(
      { $and: [ { _id: id } , {$or: [ {removed: { $exists: false } }, { not: { removed: true } } ]} ] },
      { password: 0, isAdministrator : 0, editor: 0 },
      function(err, foundUser) {
        if(!!foundUser && !foundUser.showEmail) {
          delete foundUser.email;
        }
        callback(err, foundUser);
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

module.exports.removeUser = function(email, callback) {
  var date = new Date();
 collection.update({ email: email }, { $set: {removed: true, updated_at: date} }, { }, callback) 
}

module.exports.setAsAdministrator = function(email, callback) {
  var date = new Date();
  collection.update({ email: email }, { $set: {isAdministrator: true, updated_at: date} }, { }, callback) 
}

module.exports.updateUser = function(email, updater, editor, callback) {
  updater.editor = editor;
  updater.updated_at = new Date();
  collection.update({ email: email }, { $set: updater }, { }, callback);
}

module.exports.clearUsers = function() {
  return collection.deleteMany({ })//, {multi: true}
}
