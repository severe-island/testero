"use strict"

const config = require('config')
const mongodb = require('mongodb')
const should = require('should')

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
        usersDB.setup(db)
        return usersDB.clearUsers()
      })
  })
  
  context('The user list is empty', function() {
    it('Getting the list of users. The length of the list is 0', function() {
      usersDB.findAllUsersWithoutPassword(null)
      .then(users => {
        users.should.be.an.instanceOf(Array).and.have.lengthOf(0)
      })
    })

    it('Search for the user by email', function() {
      usersDB.findUserByEmail(user1.email)
      .then(user => {
        should(user).be.null()
      })
    })
  })

  context('Adding users', function() {
    it('Adding a user', function() {
      usersDB.registerUser(user1)
      .then(user => {
        should(user).not.be.null()
        userId1 = user._id
      })
    })

    it('Getting the list of users. The length of the list is 1', function() {
      usersDB.findAllUsersWithoutPassword(null)
      .then(users => {
        users.should.be.an.instanceOf(Array).and.have.lengthOf(1)
      })
    })

    it('Search for the user by email', function() {
      usersDB.findUserByEmail(user1.email)
      .then(user => {
        should(user).not.be.null()
      })
    })

    it('Getting the user by id', function() {
      usersDB.findUserById(userId1)
      .then(user => {
        should(user).not.be.null()
        user.should.have.property('_id')
        user._id.toString().should.be.equal(userId1.toString())
      })
    })
  })
  
  after(function() {
    return usersDB.clearUsers()
  })
})
