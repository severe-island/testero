"use strict"

const config = require('config')
const mongodb = require('mongodb')
const should = require('should')

const subjectsDB = require('../../db/subjects')

describe('courses::db::subjects', function() {
  const subject1 = {
      title: 'First subject'
  }
  let subjectId1
  
  before(function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    return mongodb.MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
      .then(client => {
        return client.db(dbName)
      })
      .then(db => {
        subjectsDB.setup({mongoDBConnection: db})
        return subjectsDB.clear()
      })
  })

  context('There is no subject', function() {
    it('Getting list of subjects', function() {
      return subjectsDB.findAll()
        .then(subjects => {
          subjects.should.be.an.instanceOf(Array).and.have.lengthOf(0)
        })
    })

    it('Adding of subject', function() {
      return subjectsDB.add(subject1)
        .then(subject => {
          should(subject).not.be.null()
          subject.should.have.property('id')
          subjectId1 = subject.id
        })
    })
  })

  context('There is one subject', function() {
    it('Getting list of subjects', function() {
      return subjectsDB.findAll()
        .then(subjects => {
          subjects.should.be.an.instanceOf(Array).and.have.lengthOf(1)
        })
    })

    it('Getting of subject', function() {
      return subjectsDB.findById(subjectId1)
        .then(subject => {
          should(subject).not.be.null()
          subject.should.have.property('id')
          subject.id.should.be.equal(subjectId1)
        })
    })
  })
  
  after(function() {
    return subjectsDB.clear()
  })
})
