var config = require('../config');
var dataStore = require('nedb');

function getConnectionOptions(nameCollection)
{
  var connectionOption = 
  {
    filename: '../db/' +config.db.name + '/'+nameCollection
    ,autoload: true
    ,inMemoryOnly: false
    //,afterSerialization: 'secret'
    //,beforeDeserialization: 'secret'
    //,
  };
  return connectionOption;
};
function getIndexOption(field, uniqueOption, sparseOption)
{
  var option =
  {
    fieldName: field
    ,unique: uniqueOption
    ,sparse: sparseOption
  }
  return option;
}
function getUserScheme(userEmail, userPass, addingFields)
{
  var newUser =
  {
    email: userEmail
    ,password: userPass
    ,permission: "none"
  };
  // Дальнейший код - не протестирован!
  if (typeof addingFields !== undefined)
  {
    for(var element in addingFields)
    {
      newUser[element] = addingFields.element;
    };
  }
  return newUser;
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

module.exports.addNewUser = function (userEmail, userPass, callback)
{
  db.users.insert(getUserScheme(userEmail, userPass),
    function (err, newUser)
    {
      if (err && !newUser)
      {
        console.log("Не получилось добавить пользователя", userEmail, " : " ,err.message);
      }
      else
      {
        console.log("Запись произведена успешно! ", newdoc)
      }
      callback(err);
    });
}


