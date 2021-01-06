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
    return collection.find({ }, { password: 0 })
      .toArray()
      .then(users => {
        for (var i = 0; i < users.length; i++) {
          users[i].id = users[i]._id.toString()
          delete users[i]._id
        }
        return users
      })
  }
  else {
    return collection.find({ $or: [ {removed: { $exists: false } }, { not: { removed: true } } ] }, 
      { password: 0, isAdministrator : 0, editor: 0 })
      .toArray()
      .then(users => {
        for (var i = 0; i < users.length; i++) {
          users[i].id = users[i]._id.toString()
          delete users[i]._id
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
      .then(user => {
        if (user) {
          user.id = user._id.toString()
          delete user._id
        }
        return user
      })
  }
  else {
    return collection.findOne({$and: [ { email: userEmail },
      { $or: [ { removed: { $exists: false } }, { not: { removed: true } } ]} ]}, 
      { projection: { password: 0, isAdministrator : 0, editor: 0 } })
      .then(user => {
        if (user) {
          user.id = user._id.toString()
          delete user._id
          if (!user.showEmail) {
            delete user.email;
          }
        }
        return user
      })
  }
};

/**
 * 
 * @param {string} id 
 * @param {boolean} admin 
 */
module.exports.findUserByIdWithoutPassword = function(id, admin) {
    const _id = new mongodb.ObjectID(id)
    if (admin) {
	return collection.findOne(
	    { _id: _id },
	    { projection: { password: 0 } })
	    .then(user => {
		if (user) {
		    user.id = user._id.toString()
		    delete user._id
		}
		return user
	    })
    }
    else {
	return collection.findOne(
	    { $and: [
		{ _id: _id },
		{$or: [
		    {removed: { $exists: false } },
		    { not: { removed: true } } ]} ] },
	    { projection: { password: 0, isAdministrator : 0, editor: 0 } })
	    .then(user => {
		if (user) {
		    if (!user.showEmail) {
			delete user.email;
		    }
		    user.id = user._id.toString()
		    delete user._id
		}
		return user
	    });
    }
};


/** @param {string} userId */
module.exports.findUserById = function (userId) {
    const _id = new mongodb.ObjectID(userId)
    return collection.findOne({ _id: _id })
	.then(user => {
	    if (user) {
		user.id = user._id.toString()
		delete user._id
	    }
	    return user
    })
}


/** @param {string} userEmail */
function findUserByEmail(userEmail) {
  return collection.findOne({ email: userEmail })
    .then(user => {
      if (user) {
        user.id = user._id.toString()
        delete user._id
      }
      return user
    })
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
      let user = result.ops[0]
      user.id = user._id.toString()
      delete user.password
      return user
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
