"use strict"

const config = require('config')
const mongodb = require('mongodb')

const usersDB = require('../../db')

describe('users::db', function() {
  let user1 = {
    email: 'user1@testero',
    password: 'user1',
    passwordDuplicate: 'user1'
  }
  let userId1
  let user2 = {
    email: 'user2@testero',
    password: 'user2',
    passwordDuplicate: 'user2'
  }
  let userId2
  
  before(function(done) {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true}, (err, client) => {
      if (err) {
        throw err
      }

      const db = client.db(dbName)

      usersDB.setup(db)
      usersDB.clearUsers(function() {
        done()
      })
    })
  })
  
  context('The user list is empty.', function() {
    it('Getting the list of users.', function() {
      usersDB.findAllUsersWithoutPassword(null)
      .then(users => {
        users.should.be.Array().lengthOf(0)
      })
    })
  })
  
  after(function(done) {
    usersDB.clearUsers(function() {
      done()
    })
  })
})
