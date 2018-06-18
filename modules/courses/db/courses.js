"use strict"

const mongodb = require('mongodb')

/** @type {mongodb.Collection<any>} */
let collection

/** @param {mongodb.Db} db */
module.exports.setup = function(db) {
  collection = db.collection('courses')
}


exports.findAllCourses = function() {
  return collection.find({})
    .toArray()
    .then(courses => {
      for (let i = 0; i < courses.length; i++) {
        courses[i].id = courses[i]._id.toString()
        delete courses[i]._id
      }
      return courses
    })
}


exports.findCourses = function (filter, callback) {
  collection.find(filter).toArray(function(err, courses) { 
    if (err) {
      console.log('Ошибка получения курсов: "' + err + '"');
    }
    callback(err, courses);
  });
};


exports.findCourse = function(filter, callback) {
  collection.findOne(filter, (err, course) => {
    callback(err, course)
  })
}

/**
 * 
 * @param {string} id 
 */
exports.findCourseById = function(id) {
  return collection.findOne({_id: new mongodb.ObjectID(id)})
    .then(course => {
      if (course) {
        course.id = course._id.toString()
        delete course._id
      }
      return course
    })
}


exports.add = function(course) {
  if (course.author) {
    course.authors = [course.author];
    delete course.author;
  }
  course.created_at = new Date();
  course.updated_at = null;
  course.subjects = [ ];
  return collection.insertOne(course)
    .then(result => {
      let course = result.ops[0]
      course.id = course._id.toString()
      delete course._id
      return course
    });
};


/*exports.addCourse = function(title, author, callback) {
  var course = { title: title };
  if (author) {
    course.authors = [author];
  }
  course.created_at = new Date();
  course.updated_at = null;
  course.subjects = [ ];
  collection.insert(course, function (err, newCourse) {
    callback(err, newCourse);
  });
};*/


exports.addSubject = function(subject, callback) {
  var updated_at = new Date();
  subject.created_at = updated_at;
  collection.update({ _id: subject.course_id }, { $set: {updated_at: updated_at} }, { });
  collection.update({ _id: subject.course_id }, { $push: { subjects: subject } }, {}, callback);
};


exports.updateCourse = function(course, callback) {
  course.updated_at = new Date();
  collection.update({ _id: new mongodb.ObjectID(course.id) }, course, { }, callback);
};

module.exports.clearCourses = function() {
  return collection.deleteMany({ })
}
