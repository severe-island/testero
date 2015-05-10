var config = require('../../../config');
var dataStore = require('nedb');

function getConnectionOptions(nameCollection) {
  return  {
    filename: '../db/' +config.db.name + '/'+nameCollection,
    autoload: true,
    inMemoryOnly: false
  };
};

/*
function getIndexOption(field, uniqueOption, sparseOption) {
  var option = {
    fieldName: field
    ,unique: uniqueOption
    ,sparse: sparseOption
  }
  return option;
}*/

var collection = new dataStore(getConnectionOptions("courses-roles"));
//collection.ensureIndex(getIndexOption("email", true, false));

exports.assignRole = function(email, role, callback) {
  var date = new Date();
  collection.findOne({"email" : email, created_at: {$exists: true}}, function (err, findedUser){
    if (!err && findedUser)
    {
      collection.update({ "email": email},
                        { $addToSet: { roles: role }, $set: { updated_at: date } },
                        { upsert: true },
                        callback);
      return;
    }
    collection.insert({"email": email, roles: [role], created_at: date, update_at: date}, callback);
  });
};

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

exports.clearRoles = function(callback) {
  collection.remove({ }, { multi: true }, callback);
}