"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const supertest = require('supertest')

const coursesDB = require('../../db/courses')
const rolesDB = require('../../db/roles')
const subjectsDB = require('../../db/subjects')
const usersDB = require('../../../users/db')

describe('GET /courses/courses/:id/subjects', function () {
  let app
  let agent

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
        subjectsDB.setup(settings)
        usersDB.setup(settings)

        app = require('../../../../app')(settings)
        app.use(cookieParser())
        
        agent = supertest.agent(app)
      
        return coursesDB.clear()
          .then(() => {
              return subjectsDB.clear()
          })
          .then(() => {
            return usersDB.registerUser(user1)
            .then(data => {
              userId1 = data.id
            })
          })
      })
  })
  
  let user1 = {
    email: 'user1@user1',
    password: 'user1',
    passwordDuplicate: 'user1'
  }
  let userId1

  const  course1 = {
    title: 'Course1',
    'i-am-author': true,
    author: user1.email
  }
  let courseId1

  const subject1 = {
    title: 'Subject1'
  }
  
  context('Зарегистрирован некий курс, но без тем', function() {
    before(function() {
      return coursesDB.add(course1)
        .then(data => {
          courseId1 = data.id
      });
    })

    it('Списко тем пуст', function() {
        return agent
          .get('/courses/courses/' + courseId1 + '/subjects')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg);
            res.body.subjects.should.be.an.instanceOf(Array).and.have.lengthOf(0)
          })
    })
  })

  context('Зарегистрирован некий курс с одной темой', function() {
      before(function() {
          return coursesDB.addSubject(courseId1, subject1)
      })

      it('Список тем состоит из одного элемента', function() {
        return agent
            .get('/courses/courses/' + courseId1 + '/subjects')
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .then(res => {
            res.body.status.should.equal(true, res.body.msg);
            res.body.subjects.should.be.an.instanceOf(Array).and.have.lengthOf(1)
            })
      })
  })

  after('Clear data base', function() {
    return subjectsDB.clear()
      .then(() => {
          return coursesDB.clear()
      })
      .then(() => {
          return usersDB.clearUsers()
      })
  })
})
