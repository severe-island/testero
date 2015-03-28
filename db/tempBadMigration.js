//Файл для очищения коллекции пользователей и
//добавления трех временных пользователей.
//Наверное стоит куда-то вписать при начальной
//инициализации сервера.
//Нужен запуск сервера mongod на стандартном порте.

var db = require('../lib/dbtestero');
var userCollection = db.connection.collections['users'];

console.log("Приложение само не завершается. Выйдите, когда будет добавлено три юзера!")

userCollection.drop(function(err){
  //если коллекции нет, то она выкидвает ошибку "ns not found".
  if (!err || err.message=="ns not found"){ 
    console.log("userCollection is empty!");
    db.addNewUser('Samuray@mail.cc', 'Harakiri', function() {
      console.log("password: Harakiri");
      console.log("First template has been added")});
    
    db.addNewUser('doctorHarrison@yahoo.com', 'killers-lobsters', function() {
      console.log("password: killers-lobsters");
      console.log("Second template has been added")});
    
    db.addNewUser('test@test', '1234', function() {
      console.log("password: 1234");
      console.log("Third template has been added.")});
  }
  else{
    console.log(err); 
  }
});