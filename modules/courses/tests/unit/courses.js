"use strict"

const config = require('config')
const mongodb = require('mongodb')
const should = require('should')

const coursesDB = require('../../db/courses')

describe('courses::db::courses', function() {
  let admin = {
    email: 'admin@testero',
    password: 'admin',
    passwordDuplicate: 'admin'
  }
  let adminId
  let user1 = {
    email: 'user1@testero',
    password: 'user1',
    passwordDuplicate: 'user1'
  }
  let userId1
  let user2 = {
    email: 'user2@testero',
    showEmail: true,
    password: 'user2',
    passwordDuplicate: 'user2'
  }
  let userId2
  
  before(function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    return mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true})
      .then(client => {
        return client.db(dbName)
      })
      .then(db => {
        coursesDB.setup(db)
        return coursesDB.clearCourses()
      })
  })

  context('There is no course', function() {
    it('Getting list of courses', function() {
      return coursesDB.findAllCourses()
        .then(courses => {
          courses.should.be.an.instanceOf(Array).and.have.lengthOf(0)
        })
    })

    it('Adding of course', function() {
      return coursesDB.add({})
        .then(course => {
          should(course).not.be.null()
          course.should.have.property('id')
        })
    })
  })
  
  after(function() {
    return coursesDB.clearCourses()
  })
})
