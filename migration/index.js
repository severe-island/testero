var dataStore = require('nedb');
var config = require('../config');
var dbName = config.db.name;

// connectionOption - временами повторяется в nedbtestero, быть может необходимо
// вынести в отдельный модуль.
var connectionOption = 
  {
    filename: '../db/' +config.db.name + '/system'
    ,autoload: true
    ,inMemoryOnly: false
    //,afterSerialization: 'secret'
    //,beforeDeserialization: 'secret'
    //,
  };
  
var systemCollection = new dataStore(connectionOption);
systemCollection.findOne({version : {$exists: true}}, function(err, versionDoc) {
  var dbVersion;
  if (err || !versionDoc)
  {
    console.log("Не возможно определить версию БД для миграции.",
    "Миграции будут произведены с начала.");
    dbVersion = 0;
  }
  else
  {
    dbVersion = versionDoc.version;
  }
  var migration = require('./migration1.js');
  migration.up(dbVersion, systemCollection);
  
  });