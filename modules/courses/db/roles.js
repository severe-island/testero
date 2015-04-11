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
  collection.update({ email: email},
                    { $addToSet: { roles: role } },
                    { upsert: true },
                    function (err) {
                        if (err && !newUser) {
                          console.log("Не получилось добавить роль: " ,err.message);
                        }
                        else {
                          console.log("Роль добавлена успешно! ")
                        }
                        callback(err);
                    });
};

exports.getRolesByEmail = function(email, callback) {
  collection.findOne({ email: email }, function (err, userRoles) {
    callback(err, userRoles);
  })
}