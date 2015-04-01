var mongoose = require('mongoose');
var mongoClient = require('mongodb').MongoClient;
var connectionToDB;
var prodConf = require('../config/config.production')
var devConf = require('../config/config.development')
var testConf = require('../config/config.testing')
var confs = [prodConf, devConf, testConf];
var readline = require('readline');

var options = {roles: ["readWrite", "dbAdmin"]};

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Будут удалены:")
console.log(testConf.db.name)
console.log(prodConf.db.name)
console.log(devConf.db.name)
rl.question("Вы действительно хотите удалить БД (Y/N)?", function (answer) {
  // TODO: Log the answer in a database
  if (answer.toLowerCase() == "y")
  {
    confs.forEach(function (conf, index, arrs)
    {
      mongoClient.connect('mongodb://localhost/' + conf.db.name, function (err, db)
      {
        if (err)
        {
          console.log("Ошибка подключения");
          return;
        }
        removeUsers(conf, db);
      });
    });  
  }
  rl.close();
});

function removeUsers(conf, db)
{
  db.removeUser(conf.db.adminName, function (err, result)
  {
    if(err)
    {
      console.log("Нет пользователя в", conf.db.name, "видимо его не было, создам.");
    }
    else
    {
      console.log("Пользователь был удален в", conf.db.name);
    }
    initDB(conf, db) //надо перенести вглубь коллбэков
  });
 
}

function initDB(conf, db)
{
  db.dropDatabase(function (err, result)
  {
    if (err)
    {
      console.log("База данных ", conf.db.name, " была удалена");
      //db.db(element);
    }
    else
    {
      console.log("Невозможно удалить ", conf.db.name, ". Возможно, она не существовала.");
    }
    addUser(conf, db)
  })
}  
//Коннект для создания БД и добавления пользователя с ролями
function addUser(conf, db)
{
  db.addUser(conf.db.adminName, conf.db.adminPassword, options, function (err, result)
  {
    if (!err)
    {
      console.log("Пользователь ", conf.db.adminName, 
        ", добавлен для адиминистрирования БД", conf.db.name);
    }
    else
    {
      console.log("Ошибка добавления пользователя ", conf.db.adminName, 
        " в БД ", conf.db.name, ": ", err.message);
    }
    db.close(true, function (err, result)
    {
      if (err)
      {
        console.log("Ошибка при закрытии БД ", conf.db.name, "Ошибка:", err.message);
        return;
      }
    });
  });
}


