"use strict"

const mongodb = require('mongodb')

const testsDB = require('../db/tests')

/** @type {mongodb.Collection<any>} */
let collection

/**
 * @typedef {Object} Settings
 * @property {mongodb.Db} settings.mongoDBConnection
 * @param {Settings} settings
 */
module.exports.setup = function(settings) {
  collection = settings.mongoDBConnection.collection('subjects')
  testsDB.setup(settings)
}


exports.findAll = function() {
  return collection.find({})
    .toArray()
    .then(subjects => {
      for (let i = 0; i < subjects.length; i++) {
        subjects[i].id = subjects[i]._id.toString()
        delete subjects[i]._id
      }
      return subjects
    })
}


/**
 * Find subject by its identificator.
 * @param {string} id Identificator of subject.
 * @returns {} Object for subject.
 */
exports.findById = function(id) {
    return collection.findOne({_id: new mongodb.ObjectID(id)})
      .then(subject => {
        if (subject) {
          subject.id = subject._id.toString()
          delete subject._id
        }
        return subject
      })
}


exports.add = function(subject) {
    if (subject.author) {
      subject.authors = [subject.author];
      delete subject.author;
    }
    subject.created_at = new Date();
    subject.updated_at = null;
    return collection.insertOne(subject)
      .then(result => {
        let subject = result.ops[0]
        subject.id = subject._id.toString()
        delete subject._id
        return subject
      });
}


exports.addTest = function (subject_id, test) {
  var updated_at = new Date();
  test.created_at = updated_at;
  return testsDB.add(test)
    .then(result => {
      return collection.updateOne({
          _id: new mongodb.ObjectID(subject_id)
        }, {
          $set: {
            updated_at: updated_at
          }
        }, {})
        .then(() => {
          return collection.updateOne({
            _id: new mongodb.ObjectID(subject_id)
          }, {
            $push: {
              tests: test.id
            }
          }, {})
        })
        .then(() => {
          return result
        })
    })
}


exports.clear = function() {
    return collection.deleteMany({ })
}
