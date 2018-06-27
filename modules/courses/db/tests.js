"use strict"

const mongodb = require('mongodb')

/** @type {mongodb.Collection<any>} */
let collection

/** @param {mongodb.Db} db */
module.exports.setup = function(db) {
  collection = db.collection('tests')
}


exports.findAll = function() {
  return collection.find({})
    .toArray()
    .then(tests => {
      for (let i = 0; i < tests.length; i++) {
        tests[i].id = tests[i]._id.toString()
        delete tests[i]._id
      }
      return tests
    })
}

/**
 * Find test by its identificator.
 * @param {string} id Identificator of test.
 * @returns {} Object for test.
 */
exports.findById = function(id) {
    return collection.findOne({_id: new mongodb.ObjectID(id)})
      .then(test => {
        if (test) {
          test.id = test._id.toString()
          delete test._id
        }
        return test
      })
}


exports.add = function(test) {
    if (test.author) {
      test.authors = [test.author];
      delete test.author;
    }
    test.created_at = new Date();
    test.updated_at = null;
    return collection.insertOne(test)
      .then(result => {
        let test = result.ops[0]
        test.id = test._id.toString()
        delete test._id
        return test
      });
}


exports.clear = function() {
    return collection.deleteMany({ })
}
