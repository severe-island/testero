"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const should = require('should')
const supertest = require('supertest')

const coursesDB = require('../../db/courses')
const rolesDB = require('../../db/roles')
const usersDB = require('../../../users/db')

describe('GET /courses/roles/?email=email', function() {
  let agent
  let app

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
        const db = client.db(dbName)

        /**
         * @typedef {Object} Settings
         * @property {mongodb.Db} settings.mongoDBConnection
         * @type {Settings} settings
         */
        const settings = {
          mongoDBConnection: db
        }
    
        coursesDB.setup(settings)
        rolesDB.setup(settings)
        usersDB.setup(settings)

        app = require('../../../../app')(settings)
        app.use(cookieParser())

        agent = supertest.agent(app)

        return coursesDB.clear()
          .then(() => {
            return rolesDB.clearRoles()
          })
          .then(() => {
            return usersDB.clearUsers()
          })
      })
  })

  describe('Получение списка ролей по email', function() {
    let admin ={
      email: "admin@admin",
      password: "1234"
    }
    let adminId

    before('Добавление тестового пользователя в БД', function() {
      return usersDB.registerUser({
        email: admin.email,
        password: admin.password,
        isAdministrator: true,
        registeredBy: "admin@admin"
      })
      .then(user => {
        adminId = user.id
      })
    })
    
    context('Пользователь не имеет ролей', function() {
      it('Получен пустой список', function() {
        return agent
          .get('/courses/roles/?email=' + admin.email)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg);
            res.body.roles.should.be.an.instanceOf(Array).and.have.lengthOf(0)
          });
      });
    });
    
    context('Пользователь имеет несколько ролей', function() {
      before('Назначение нескольких ролей пользователю', function() {
        return rolesDB.assignRole(adminId, "teacher")
          .then(() => {
            return rolesDB.assignRole(adminId, "student")
          })
      })
      
      it('Получен массив ["teacher", "student"]', function() {
        return agent
          .get('/courses/roles/?email=' + admin.email)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg);
            should(res.body.roles).not.null()
            res.body.roles.should.containEql("student");
            res.body.roles.should.containEql("teacher");
          })
      })
      
      after('Очистка ролей после теста', function() {
        return rolesDB.clearRoles()
      });
    });
  })

  after(function() {
    return usersDB.clearUsers()
  })
})
