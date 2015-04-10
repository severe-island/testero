var dataStore = require('nedb');
var fs = require('fs');
var config = require('../config');

var description = "Добавление поля под дату регистрации в коллекции users.";
var currentVersion = 2;
var connectionOption =
  {
    filename: './db/' + config.db.name + '/users'
    , autoload: true
    , inMemoryOnly: false
      //,afterSerialization: 'secret'
      //,beforeDeserialization: 'secret'
      //,
  };

var isNextMigrationExist = fs.existsSync("./migration/migration" + (currentVersion + 1) + ".js");

module.exports.up = function up(dbVersion, systemCollection)
{
  if (dbVersion < currentVersion)
  {
    var tempDate = new Date(); 
    var dateTime = new Date( tempDate.getFullYear(),
  tempDate.getMonth() + 1,
  tempDate.getDate(),
  tempDate.getHours(), 
  tempDate.getMinutes(), 
  tempDate.getSeconds());
    userCollection = new dataStore(connectionOption);
    userCollection.update({email: {$exists : true}},
      {$set: {date: dateTime}},
    {multi: true},
    function (err, result) {
      if (err)
      {
        console.log("Ошибка в миграции", currentVersion);
        return;
      }
      systemCollection.update({version: dbVersion}, {version: currentVersion}, function (err, doc) {
        if (err)
        {
          console.log("Ошибка при обновлении версии БД до", currentVersion);
          return;
        }
        else
        {
          console.log("Миграция", currentVersion, "произведена успешно!");
          console.log("Описание миграции:", description);
          systemCollection.persistence.compactDatafile();
        }
        if (isNextMigrationExist)
        {
          var nextMigration = require("./migration" + (currentVersion + 1));
          nextMigration.up(dbVersion + 1, systemCollection);
        }
      });

    });
  }
  else
  {
    if (isNextMigrationExist)
    {
      var nextMigration = require("./migration" + (currentVersion + 1));
      nextMigration.up(dbVersion, systemCollection);
    }
    ;
  }
}

/*module.exports.down = function down()
 {
 try
 {
 dbtestero.connection.collection['users'].drop(function (err, result)
 {
 if (!err)
 {
 console.log("Коллекция users была удалена");
 }
 });
 }
 catch (err)
 {
 if (err)
 {
 console.log("Ошибка в migration", currentVersion, ": ", err.message);
 }
 else
 {
 console.log("migration", currentVersion, " down был пройден");
 }
 }
 }*/