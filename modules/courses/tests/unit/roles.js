"use strict"

const config = require('config')
const mongodb = require('mongodb')

const userDB = require('../../../users/db')
const rolesDB = require('../../db/roles')

describe('courses::db::roles', function() {
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

    return mongodb.MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
      .then(client => {
        return client.db(dbName)
      })
      .then(db => {
        rolesDB.setup({mongoDBConnection: db})
        return rolesDB.clearRoles()
      })
  })

  context('Пользователь без назначенных ролей', function() {
    before(function() {
      return userDB.registerUser(user1).then(res => {
        userId1 = res.id
      })
    })

    it('Назначение роли student самому себе', function() {
      return rolesDB.assignRole(userId1, 'student')
        .then(() => {
            return rolesDB.getRolesByUserId(userId1)
        })
        .then(roles => {
            roles.should.be.an.instanceOf(Array).and.have.lengthOf(1)
            roles.should.containEql('student')
        })
    })
  })
})
