var config = require('../../../config');
var dataStore = require('nedb');

function getConnectionOptions(nameCollection) {
  return  {
    filename: '../db/' +config.db.name + '/'+nameCollection,
    autoload: true,
    inMemoryOnly: false
  };
};

/*
function getIndexOption(field, uniqueOption, sparseOption) {
  var option = {
    fieldName: field
    ,unique: uniqueOption
    ,sparse: sparseOption
  }
  return option;
}*/

var collection = new dataStore(getConnectionOptions("courses"));
//collection.ensureIndex(getIndexOption("email", true, false));

exports.findAllCourses = function (callback) {
  collection.find ({}, function (err, courses) { 
    if(err) {
      console.log("Ошибка получения курсов: ")
      console.log(err)
    }
    callback(err, courses)
  })
};

exports.findCourse = function (filter, callback) {
  collection.findOne (filter, callback);
}

exports.addCourse = function(course, callback) {
  collection.insert(course, function (err, newUser) {
    if (err && !newUser) {
      console.log("Не получилось добавить пользователя", userEmail, " : " ,err.message);
    }
    else {
      console.log("Запись произведена успешно! ", newUser)
    }
    callback(err);
  });
};

exports.updateCourse = function(course, callback) {
  collection.update({ _id: course._id }, course, { }, callback);
};