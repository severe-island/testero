var config = require('../../../config');
var dataStore = require('nedb');

function getConnectionOptions(nameCollection) {
  return  {
    filename: '../db/' +config.db.name + '/'+nameCollection,
    autoload: true,
    inMemoryOnly: false
  };
};

function getIndexOption(field, uniqueOption, sparseOption) {
  var option = {
    fieldName: field
    ,unique: uniqueOption
    ,sparse: sparseOption
  }
  return option;
}

var collection = new dataStore(getConnectionOptions("users"));
collection.ensureIndex(getIndexOption("email", true, false));

module.exports.findAllUsersWithoutPassword = function (admin, callback) {
  if(admin) {
    collection.find({ }, { password: 0 }, function (err, users) {
      callback(err, users);
    })
  } else {
    collection.find({ $or: [ {removed: { $exists: false } }, { not: { removed: true } } ] }, 
    { password: 0, isAdministrator : 0, editor: 0 }, function (err, users) {
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
  if(admin) {
    collection.findOne({ email: userEmail }, 
    { password: 0 },
    function (err, findedUser) {
      callback(err, findedUser);
    }); 
  } else {
    collection.findOne({$and: [ { email: userEmail } , {$or: [ {removed: { $exists: false } }, { not: { removed: true } } ]} ]}, 
                       { password: 0, isAdministrator : 0, editor: 0 }, function (err, findedUser) {
                        if(!findedUser.showEmail) {
                          delete findedUser.email;
                        }
                        callback(err, findedUser);
                      }); 
  }
};

module.exports.findUserByIdWithoutPassword = function (id, admin, callback) {
  if(admin) {
    collection.findOne({ id: id }, 
    { password: 0 }, function (err, findedUser) {
      callback(err, findedUser);
    }); 
  } else {
    collection.findOne({$and: [ { id: id } , {$or: [ {removed: { $exists: false } }, { not: { removed: true } } ]} ]}, 
                       { password: 0, isAdministrator : 0, editor: 0 }, function (err, findedUser) {
                         if(!findedUser.showEmail) {
                           delete findedUser.email;
                         }
                         callback(err, findedUser);
                       }); 
  }
};

module.exports.findUserByEmail = function (userEmail, callback) {
  collection.findOne({ email: userEmail }, function (err, findedUser) {
    if (err && config.mode !== "testing")
    {
      console.log("Ошибка при поиске пользователя ", userEmail, " :", err.message);
    }
    callback(err, findedUser);
  }); 
};

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


module.exports.registerUser = function(data, callback) {
  var date = new Date();
  collection.insert({
    email: data.email,
    password: data.password,
    isAdministrator: data.isAdministrator,
    showEmail: false,
    created_at: date,
    updated_at: null,
    registeredBy: data.registeredBy
  }, function (err, newUser) {
    callback(err, newUser);
  });
};

// DEPRECATED:

module.exports.addNewUser = function (userEmail, userPass, isAdministrator, callback) {
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

module.exports.clearUsers = function(callback) {
  collection.remove({ }, {multi: true}, callback);
}