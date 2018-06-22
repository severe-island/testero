"use strict"

const mongodb = require('mongodb')

/** @type {mongodb.Collection<any>} */
let collection

const subjectsDB = require('./subjects')

/** @param {mongodb.Db} db */
module.exports.setup = function (db) {
  collection = db.collection('courses')
  subjectsDB.setup(db)
}


exports.findAll = function () {
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


exports.findAllWithFilter = function (filter, callback) {
  collection.find(filter).toArray(function (err, courses) {
    if (err) {
      console.log('Ошибка получения курсов: "' + err + '"');
    }
    callback(err, courses);
  });
};


exports.findWithFilter = function (filter, callback) {
  collection.findOne(filter, (err, course) => {
    callback(err, course)
  })
}

/**
 * 
 * @param {string} id 
 */
exports.findById = function (id) {
  return collection.findOne({
      _id: new mongodb.ObjectID(id)
    })
    .then(course => {
      if (course) {
        course.id = course._id.toString()
        delete course._id
      }
      return course
    })
}


exports.add = function (course) {
  if (course.author) {
    course.authors = [course.author];
    delete course.author;
  }
  course.created_at = new Date();
  course.updated_at = null;
  course.subjects = [];
  return collection.insertOne(course)
    .then(result => {
      let course = result.ops[0]
      course.id = course._id.toString()
      delete course._id
      return course
    });
};


exports.addSubject = function (course_id, subject) {
  var updated_at = new Date();
  subject.created_at = updated_at;
  return subjectsDB.add(subject)
    .then(result => {
      return collection.updateOne({
          _id: new mongodb.ObjectID(course_id)
        }, {
          $set: {
            updated_at: updated_at
          }
        }, {})
        .then(() => {
          return collection.updateOne({
            _id: new mongodb.ObjectID(course_id)
          }, {
            $push: {
              subjects: subject.id
            }
          }, {})
        })
        .then(() => {
          return result
        })
    })
};


exports.addAuthor = function (course_id, author_email) {
  var updated_at = new Date();

  return collection.update({
      _id: new mongodb.ObjectID(course_id)
    }, {
      $set: {
        updated_at: updated_at
      }
    }, {})
    .then(() => {
      return collection.update({
        _id: new mongodb.ObjectID(course_id)
      }, {
        $push: {
          authors: author_email
        }
      }, {})
    })
};


exports.update = function (course, callback) {
  course.updated_at = new Date();
  collection.update({
    _id: new mongodb.ObjectID(course.id)
  }, course, {}, callback);
};


module.exports.clear = function () {
  return collection.deleteMany({})
}