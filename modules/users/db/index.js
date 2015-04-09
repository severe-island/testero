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

var db = {}
db.users = new dataStore(getConnectionOptions("users"));
db.users.ensureIndex(getIndexOption("email", true, false));

module.exports.findUserByEmail = function (userEmail, callback)
{
  db.users.findOne({email: userEmail}, function (err, findedUser) {
    if (err)
    {
      console.log("Ошибка при поиске пользователя ", userEmail, " :", err.message);
    }
    callback(err, findedUser);
  }); 
};

module.exports.isAdminExists = function (callback)
{
  db.users.findOne({permission: "admin"}, function (err, adminUser)
  {
    if (!err && adminUser)
    {
      callback(true);
      console.log('!!!!',adminUser,'!!!!')
    }
    else
    {
      callback(false);
    }
  });
}

module.exports.addNewUser = function (userEmail, userPass, userPermission, callback)
{
  db.users.insert({
    email: userEmail,
    password: userPass,
    permission: userPermission
  }, function (err, newUser) {
    if (err && !newUser)
    {
      console.log("Не получилось добавить пользователя", userEmail, " : " ,err.message);
    }
    else
    {
      console.log("Запись произведена успешно! ", newUser)
    }
    callback(err);
  });
}
