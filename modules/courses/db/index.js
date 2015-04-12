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

exports.addCourse = function(title, author, callback) {
  var course = { title: title }
  if(author) course.authors = [author]
  var date = new Date();
  course.created_at = date;
  course.updated_at = date;
  collection.insert(course, function (err, newUser) {
    if (err && !newUser) {
      console.log("Не получилось добавить курс", title, " : " ,err.message);
    }
    else {
      console.log("Запись произведена успешно! ", title)
    }
    callback(err);
  });
};

exports.updateCourse = function(course, callback) {
  course.updated_at = new Date();
  collection.update({ _id: course._id }, course, { }, callback);
};