"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const express = require('express')
const mongodb = require('mongodb')
const supertest = require('supertest')

const usersDB = require('../../db')

/** @type {supertest.SuperTest<supertest.Test>} */
let agent
/** @type {express.Express} */
let app

describe('/users/users/:id/auth', function() {
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
  
  before('Connect to database', function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    return mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true})
      .then(client => {
        const db = client.db(dbName)

        app = require('../../../../app')(db)
        app.use(cookieParser())

        agent = supertest.agent(app)

        usersDB.setup(db)
        return usersDB.clearUsers()
      })
  })
  
  context('There are no registered users', function () {
    it('Authorization check', function() {
      return agent
        .get('/users/users/424242424242424242424242/auth')
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg)
        })
    })

    it('Authorization check with incorrect id', function() {
      return agent
        .get('/users/users/42/auth')
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg)
        })
    })

    it('Attempt of authorization', function() {
      return agent
        .post('/users/users/424242424242424242424242/auth')
        .send({password: user1.password})
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg)
        })
    })

    it('Attempt of authorization with incorrect id', function() {
      return agent
        .post('/users/users/42/auth')
        .send({password: user1.password})
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg)
        })
    })

    it('Unauthorize', function() {
      return agent
        .delete('/users/users/424242424242424242424242/auth')
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        })
    })

    it('Unauthorize with incorrect id', function() {
      return agent
        .delete('/users/users/42/auth')
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        })
    })
  })

  context('There are several users', function() {
    before(function() {
      return Promise.all([
        usersDB.registerUser(user1)
        .then(data => {
          userId1 = data._id
        }),
        usersDB.registerUser(user2)
        .then(data => {
          userId2 = data._id
        })
      ])
    })

    it('User is not authorized. Authorization check', function() {
      return agent
        .get('/users/users/' + userId1 + '/auth')
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg);
        })
    })
    
    it('An attempt to authorize without specifying a password', function() {
      return agent
        .post('/users/users/' + userId1 + '/auth')
        .send({})
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg)
        })
    })
    
    it('Successful authorization', function() {
      return agent
        .post('/users/users/' + userId1 + '/auth')
        .send({password: user1.password})
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        })
    })
    
    it('User is authorized. Authorization check', function() {
      return agent
        .get('/users/users/' + userId1 + '/auth')
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        })
    })

    it('Reauthorization', function() {
      return agent
        .post('/users/users/' + userId1 + '/auth')
        .send({password: user1.password})
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        })
    })

    it('Authorization under one more user', function() {
      return agent
        .post('/users/users/' + userId2 + '/auth')
        .send({password: user2.password})
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        })
    })
    
    it('Unauthorize', function() {
      return agent
        .delete('/users/users/' + userId1 + '/auth')
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        })
    })

    it('User is not authorized. Authorization check', function() {
      return agent
        .get('/users/users/' + userId1 + '/auth')
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg)
        })
    })
    
    it('Re-termination of authorization.', function() {
      return agent
        .delete('/users/users/' + userId1 + '/auth')
        .set('Accept', 'application/json')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        })
    })
  })

  after(function() {
    return usersDB.clearUsers()
  })
})
