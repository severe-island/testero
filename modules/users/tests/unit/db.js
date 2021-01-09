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

    return mongodb.MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
      .then(client => {
        return client.db(dbName)
      })
      .then(db => {
        usersDB.setup({mongoDBConnection: db})
        return usersDB.clearUsers()
      })
  })
  
  context('The user list is empty', function() {
    it('Getting the list of users. The length of the list is 0', function() {
      return usersDB.findAllUsersWithoutPassword(null)
        .then(users => {
          users.should.be.an.instanceOf(Array).and.have.lengthOf(0)
        })
    })

    it('Search for the user by email', function() {
      return usersDB.findUserByEmail(user1.email)
        .then(user => {
          should(user).be.null()
        })
    })
  })

  context('Adding users', function() {
    it('Adding a user', function() {
      return usersDB.registerUser(user1)
        .then(user => {
          should(user).not.be.null()
          userId1 = user.id
        })
    })

    it('Getting the list of users. The length of the list is 1', function() {
      return usersDB.findAllUsersWithoutPassword(false)
        .then(users => {
          users.should.be.an.instanceOf(Array).and.have.lengthOf(1)
          users[0].should.have.not.properties(['password', 'isAdministrator', 'editor'])
        })
    })

    it('Search for the user by email', function() {
      return usersDB.findUserByEmail(user1.email)
        .then(user => {
          should(user).not.be.null()
        })
    })

    it('Getting the user by id', function() {
      return usersDB.findUserById(userId1)
        .then(user => {
          should(user).not.be.null()
          user.should.have.property('id')
          user.id.should.be.equal(userId1)
          user.should.have.property('email')
          user.email.should.be.equal(user1.email)
        })
    })

    it('Getting the user by id without password', function() {
      return usersDB.findUserByIdWithoutPassword(userId1, false)
        .then(user => {
          should(user).not.be.null()
          user.should.have.not.property('editor')
          user.should.have.not.property('email')
          user.should.have.not.property('isAdministrator')
          user.should.have.not.property('password')
          user.should.have.not.property('removed')
        })
    })

    it('Getting the user by email without password', function() {
      return usersDB.findUserByEmailWithoutPassword(user1.email, false)
        .then(user => {
          should(user).not.be.null()
          user.should.have.not.property('editor')
          user.should.have.not.property('email')
          user.should.have.not.property('isAdministrator')
          user.should.have.not.property('password')
          user.should.have.not.property('removed')
        })
    })

    it('Getting the user by id without password by administrator', function() {
      return usersDB.findUserByIdWithoutPassword(userId1, true)
        .then(user => {
          should(user).not.be.null()
          user.should.have.property('isAdministrator')
          user.should.have.not.property('password')
        })
    })

    it('Adding the second user', function() {
      return usersDB.registerUser(user2)
        .then((user) => {
          should(user).not.be.null()
          userId2 = user.id
        })
    })

    it('Getting the list of users. The length of the list is 1', function() {
      return usersDB.findAllUsersWithoutPassword(true)
        .then(users => {
          users.should.be.an.instanceOf(Array).and.have.lengthOf(2)
          users.forEach(user => {
            user.should.have.properties(['password', 'isAdministrator'])
          });
        })
    })

    it('Getting the user by id without password with email', function() {
      return usersDB.findUserByIdWithoutPassword(userId2, false)
        .then(user => {
          should(user).not.be.null()
          user.should.have.property('email')
        })
    })

    it('Secondary adding the second user', function() {
      return usersDB.registerUser(user2)
        .then((user) => {
          should(user).not.be.null()
        })
        .catch(err => {
          err.should.have.property('message')
        })
    })
  })

  context('Editing user', function() {
    it('Set user as administrator', function() {
      return usersDB.setAsAdministrator(user2.email, user1.email)
        .then((result) => {
          should(result).not.be.null()
          result.should.have.value('matchedCount', 1)
          result.should.have.value('modifiedCount', 1)

          return usersDB.findUserByEmail(user2.email)
        })
        .then((user) => {
          user.should.have.value('isAdministrator', true)
          user.should.have.properties(['editor', 'updated_at'])
        })
    })

    it('Update field "isAdminstrator"', function() {
      return usersDB.updateUser(user2.email, { isAdministrator: false }, user1.email)
        .then(result => {
          should(result).not.be.null()
          result.should.have.value('matchedCount', 1)
          result.should.have.value('modifiedCount', 1)

          return usersDB.findUserByEmail(user2.email)
        })
        .then((user) => {
          user.should.have.value('isAdministrator', false)
          user.should.have.properties(['editor', 'updated_at'])
        })
    })
  })

  context('Deleting users', function() {
    it('Delete the second user', function() {
      return usersDB.removeUser(user2.email)
        .then((result) => {
          should(result).not.be.null()
          result.should.have.value('matchedCount', 1)
          result.should.have.value('modifiedCount', 1)
          
          return usersDB.findUserByEmail(user2.email)
        })
        .then((user) => {
          user.should.have.property('removed')
        })
    })

    it('Getting the second user by id without password by administrator', function() {
      return usersDB.findUserByIdWithoutPassword(userId2, true)
        .then(user => {
          should(user).not.be.null()
          user.should.have.not.property('password')
          user.should.have.property('removed')
        })
    })

    it('Getting the second user by email without password', function() {
      return usersDB.findUserByEmailWithoutPassword(user2.email, false)
        .then(user => {
          should(user).be.null()
        })
    })

    it('Getting the second user by email without password by administrator', function() {
      return usersDB.findUserByEmailWithoutPassword(user2.email, true)
        .then(user => {
          should(user).not.be.null()
          user.should.have.value('removed', true)
        })
    })
  })
  
  after(function() {
    return usersDB.clearUsers()
  })
})
