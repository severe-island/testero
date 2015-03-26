//Файл для очищения коллекции пользователей и
//добавления трех временных пользователей.
//Наверное стоит куда-то вписать при начальной
//инициализации сервера.
//Нужен запуск сервера mongod на стандартном порте.

var db = require('./lib/dbtestero');
var userCollection = db.connection.collections['users'];
userCollection.drop(function(err){
	if (!err)
	{
		console.log("userCollection is empty!");
		db.addNewUser('Samuray@mail.cc', 'Harakiri', function() {
		console.log("First template has been added")});

		db.addNewUser('doctorHarrison@yahoo.com', 'killers-lobsters', function() {
		console.log("Second template has been added")});

		db.addNewUser('snowlyBlack@yahoo.com', 'sssAAAlll', function() {
		console.log("Third template has been added")});
	}
});

