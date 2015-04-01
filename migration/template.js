var dbVersion = require('../config');
var mongoose = require('mongoose');
var currentVersion = ;

module.exports.up = function up()
{
    try
    {
        

    }
    catch (err)
    {
        if (!err)
        {
            console.log("migration", currentVersion, " up пройден");
        }
        else
        {
            console.log(err.message);
        }
    }
}

module.exports.down = function down(currentVersion)
{
    try
    {
        
    }
    catch(err)
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
}