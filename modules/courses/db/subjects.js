"use strict"

const mongodb = require('mongodb')

/** @type {mongodb.Collection<any>} */
let collection

/** @param {mongodb.Db} db */
module.exports.setup = function(db) {
  collection = db.collection('subjects')
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


exports.clear = function() {
    return collection.deleteMany({ })
}
