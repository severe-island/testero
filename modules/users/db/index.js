"use strict"

const mongodb = require('mongodb')

var collection;

module.exports.setup = function(db) {
  collection = db.collection('users')
}

module.exports.findAllUsersWithoutPassword = function (admin, callback) {
  if (admin) {
    collection.find({ }, { password: 0 }).toArray(function (err, users) {
      callback(err, users);
    })
  }
  else {
    collection.find({ $or: [ {removed: { $exists: false } }, { not: { removed: true } } ] }, 
    { password: 0, isAdministrator : 0, editor: 0 }).toArray(function (err, users) {
      for(var i=0; i<users.length; i++) {
        if(!users[i].showEmail) {
          delete users[i].email;
        }
      }
      callback(err, users);
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


module.exports.findUserById = function (userId, callback) {
  collection.findOne({ _id: new mongodb.ObjectID(userId) }, function (err, foundUser) {
    if (err && process.env.NODE_ENV !== "testing") {
      console.log("Ошибка при поиске пользователя ", userId, " :", err.message);
    }
    callback(err, foundUser);
  }); 
};


function findUserByEmail(userEmail, callback) {
  collection.findOne({ email: userEmail }, function (err, foundUser) {
    if (err && process.env.NODE_ENV !== "testing")
    {
      console.log("Ошибка при поиске пользователя ", userEmail, " :", err.message);
    }
    callback(err, foundUser);
  }); 
};

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


module.exports.registerUser = function(userData, callback) {
  findUserByEmail(userData.email, (err, user) => {
    if (err) {
      callback(err, null)
      return
    }
    if (user) {
      callback(new Error('User exist'), null)
      return
    }
    collection.insertOne({
      email: userData.email,
      password: userData.password,
      isAdministrator: userData.isAdministrator,
      showEmail: userData.showEmail || false,
      created_at: new Date(),
      updated_at: null,
      registeredBy: userData.registeredBy
    }, (err, result) => {
      if (err) {
        callback(err, null)
      }
      callback(null, result.ops[0])
    })
  })
}

// DEPRECATED:

/*module.exports.addNewUser = function (userEmail, userPass, isAdministrator, callback) {
  var date = new Date();
  collection.insert({
    email: userEmail,
    password: userPass,
    isAdministrator: isAdministrator,
    showEmail: false,
    created_at: date,
    updated_at: null
  }, function (err, newUser) {
    callback(err, newUser);
  });
}*/

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

module.exports.clearUsers = function(callback) {
  collection.remove({ }, {multi: true}, callback);
}