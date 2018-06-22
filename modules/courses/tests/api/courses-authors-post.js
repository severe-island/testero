"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const should = require('should')
const supertest = require('supertest')

const coursesDB = require('../../db/courses')
const rolesDB = require('../../db/roles')
const usersDB = require('../../../users/db')

describe('POST /courses/courses/:id/authors', function () {
  let app
  let agent

  const user1 = {
    email: 'user1@user1',
    password: 'user1'
  }
  let userId1

  const user2 = {
    email: 'user2@user2',
    password: 'user2'
  }
  let userId2

  const course1 = {
    title: 'Course1'
  }
  let courseId1

  const course2 = {
    title: 'Course2',
    author: user1.email
  }
  let courseId2

  before(function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    return mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true})
      .then(client => {
        const db = client.db(dbName)
        
        coursesDB.setup(db)
        rolesDB.setup(db)
        usersDB.setup(db)

        app = require('../../../../app')(db)
        app.use(cookieParser())
        
        agent = supertest.agent(app)
      
        return coursesDB.clear()
          .then(() => {
            return usersDB.clearUsers()
          })
          .then(() => {
            return usersDB.registerUser(user1)
          })
          .then(data => {
            userId1 = data.id
            return usersDB.registerUser(user2)
          })
          .then(data => {
            userId2 = data.id
          })
      })
  })

  context('Зарегистрирован некий курс', function() {
    before(function() {
      return coursesDB.add(course1)
        .then(data => {
          courseId1 = data.id;
      });
    });

    it('Пользователь не авторизован: отказ', function() {
      return agent
        .post('/courses/courses/' + courseId1 + '/authors')
        .send({email: user2.email})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg);
        });
    });
    
    it('Пользователь авторизован, но не является автором: отказ', function() {
      return agent
        .post('/users/users/' + userId1 + '/auth')
        .send({password: user1.password})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg);
          
          return agent
            .post('/courses/courses/' + courseId1 + '/authors')
            .send({email: user2.email})
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .then(res => {
              res.body.status.should.equal(false, res.body.msg);
            });
        });
    });
    
    it('Пользователь авторизован и является автором: успех.', function() {
      return coursesDB.add(course2)
        .then((course) => {
          courseId2 = course.id

          return agent
            .post('/courses/courses/' + courseId2 + '/authors')
            .send({email: user2.email})
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .then(res => {
              res.body.status.should.equal(true, res.body.msg);
            })
        })
    })
  });
  
  context('Нет ни одного курса', function() {
    before(function() {
      return coursesDB.clear()
    })
    
    it('Попытка добавить к несуществующему курсу автора', function() {
        return agent
            .post('/users/users/' + userId1 + '/auth')
            .send({password: user1.password})
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .then(res => {
                res.body.status.should.equal(true, res.body.msg);

                return agent
                    .post('/courses/courses/719825791875/authors')
                    .send({email: user2.email})
                    .set('X-Requested-With', 'XMLHttpRequest')
                    .expect('Content-Type', /application\/json/)
                    .expect(200)
                    .then(res => {
                        res.body.status.should.equal(false, res.body.msg);
                    });
            });
    })
  })

  after(function() {
    return usersDB.clearUsers()
  })
})
