var dataStore = require('nedb');
var fs = require('fs');
var config = require('../config');

var description = "Добавление системной коллекции system.";
var currentVersion = 1;

var isNextMigrationExist = fs.existsSync("./migration/migration" + (currentVersion + 1) + ".js");

module.exports.up = function up(dbVersion, systemCollection)
{
  if (dbVersion < currentVersion)
  {
    systemCollection.insert({version: currentVersion}, function (err, doc) {
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

  }
  else
  {
    if (isNextMigrationExist)
    {
      console.log("Переход к другой миграции");
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