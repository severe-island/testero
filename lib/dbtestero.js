//Нужен запуск сервера mongod на стандартном порте.
var config = require('../config');
var mongoose = require('mongoose');
//testeroDB - имя бд (или имя создаваемой дб, если нет) 
var connectionToDB = mongoose.connect('mongodb://'+
        config.db.adminName + ':' + config.db.adminPassword +
        '@localhost/' + config.db.name);
var userSchema = new mongoose.Schema( {
	email: {type: String },
	password: {type: String},
	permission: {type: String, default: "none"}
});
var modelOfUser = connectionToDB.model("user", userSchema);


//callback(err, data)
module.exports.findUserByEmail = function (userEmail, callback){
        var query = modelOfUser.where({email: userEmail});
        query.findOne(function (err, someUser){
                callback(err, someUser);
        })
};

//callback (err) - передается информация о возможной ошибке
module.exports.addNewUser = function addNewUser(userEmail, userPass, callback) {
	try
	{
	var newUser = new modelOfUser ( {
		email: userEmail,
		password: userPass
	});
	newUser.save(function (err, newUser){
		if (!err)
		{
			console.log("New user: ", userEmail);
		}
		callback(err);
	});
	}
	catch (err)
	{
		if (err)
		{
		console.log("Saving error: ", userEmail);
		}
	}
}

module.exports.connection = mongoose.connection;