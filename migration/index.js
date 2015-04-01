var dbtestero = require('../lib/dbtestero');
var config = require('../config');

var dbVersion = -1;
try
{
   var configCollection = dbtestero.connection.collections['config'];
   if (configCollection)
   {
      configCollection.findOne("version", function(err, result)
         {
            if (!err && result)
            {
               dbVersion = result['version'];
            }
         });
   }
   else{
      console.log("Невозможно определить версию БД");
      console.log("Миграции не будут произведены");
   }
}
catch(err)
{
   if(err)
   {
      console.log(err.message);
   }
}

config.dbVersion = dbVersion;


if (dbVersion != -1)
{
    var i = dbVersion + 1;
    var migratingStatus = true
    while (migratingStatus)
    {
        try
        {
            var migration = require("migration" + i);
            migration.up();
            config.dbVersion = i;
        }
        catch (err)
        {
            if (err)
            {
                console.log("Миграция окончена на версии ", config.dbVersion);
                migratingStatus = false;
            }
        }
        i++;
    }
}
