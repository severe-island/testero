var dataStore = require('nedb');
var fs = require('fs');
var config = require('../config');

var description = //ОПИСАНИЕ МИГРАЦИИ;
var currentVersion = //ВЕРСИЯ МИГРАЦИИ;

//ПРОВЕРКА НА СЛЕДУЮЩИЙ ФАЙЛ МИГРАЦИИ
var isNextMigrationExist = fs.existsSync("./migration" + (currentVersion + 1) + ".js");

//В up передается текущая версия БД, а также объект коллекции system(создается в первой миграции)
module.exports.up = function up(dbVersion, systemCollection)
{
  if (dbVersion < currentVersion)
  {
    //КОД МИГРАЦИИ (ЗДЕСЬ ЖЕ БУДЕТ СИНХРОННЫЙ ВЫЗОВ СЛЕДУЮЩЕЙ МИГРАЦИИ И ОБНОВЛЕНИЕ ВЕРСИИ БД)
  }
  else
  {
    // ЭТО НА СЛУЧАЙ, ЕСЛИ ТЕКУЩАЯ ВЕРСИЯ БД БОЛЬШЕ ТЕКУЩЕЙ ВЕРСИИ МИГРАЦИИ (ПРОСТО ПЕРЕХОДИМ К СЛЕДУЮЩИМ ФАЙЛАМ)
    if (isNextMigrationExist)
    {
      var nextMigration = require("./migration" + (currentVersion + 1);
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