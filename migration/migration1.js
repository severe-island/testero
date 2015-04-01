var dbVersion = require('../config');
var dbtestero = require('../lib/dbtestero');

var currentVersion = 1;

module.exports.up = function up()
{
    try
    {
        dbtestero.connection.collection('users');
        var userSchema = new dbtestero.mongoose.Schema({
            email: {type: String},
            password: {type: String},
            permission: {type: String, default: "none"}},
        {collection: 'users'});
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

module.exports.down = function down()
{
    try
    {
        dbtestero.connection.collection['users'].drop(function(err, result)
        {
            if (!err)
            {
                console.log("Коллекция users была удалена");
            }
        });
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