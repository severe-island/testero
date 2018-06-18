"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const supertest = require('supertest')

let agent
let app
let usersDB

describe('PATCH /users/users', function () {
  before('Connect to database', function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    return mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true})
      .then(client => {
        const db = client.db(dbName)

        usersDB = require('../../db')
        usersDB.setup(db)

        app = require('../../../../app')(db)
        app.use(cookieParser())
        
        agent = supertest.agent(app)

        return usersDB.clearUsers()
    })
  })

  context('There is one user. Update yourself', function() {
      let userData = {
        email: 'user@user',
        password: 'user'
      }
      let userId

      before('Adding and authorize user', function() {
        return usersDB.registerUser(userData)
            .then(user => {
                userId = user.id

                return agent
                    .post('/users/users/' + userId + '/auth')
                    .send({password: userData.password})
                    .set('X-Requested-With', 'XMLHttpRequest')
                    .expect('Content-Type', /application\/json/)
                    .expect(200)
                    .then(res => {
                        res.body.status.should.equal(true, res.body.msg)
                    })
          })
      })

      it('Update the name of user', function() {
        let userUpdater = {
            name: 'Name'
        }
        return agent
            .patch('/users/users/' + userId)
            .send(userUpdater)
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .then(res => {
                res.body.status.should.equal(true, res.body.msg)

                return agent
                    .get('/users/users/' + userId)
                    .set('X-Requested-With', 'XMLHttpRequest')
                    .expect('Content-Type', /application\/json/)
                    .expect(200)
                    .then(res => {
                        res.body.status.should.equal(true, res.body.msg)
                        res.body.user.should.have.property('name')
                        res.body.user.name.should.equal(userUpdater.name)
                    })
            })
      })

      it('Update the password of user', function() {
        let newPassword = 'newPassword'
        return agent
            .patch('/users/users/' + userId)
            .send({
                oldPassword: userData.password,
                password: newPassword,
                passwordDuplicate: newPassword
            })
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .then(res => {
                res.body.status.should.equal(true, res.body.msg)
            })
      })
  })

  after('Cleaning the collection users', function() {
    return usersDB.clearUsers()
  })
})
