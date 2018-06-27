"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const should = require('should')
const supertest = require('supertest')

const coursesDB = require('../../db/courses')
const rolesDB = require('../../db/roles')
const usersDB = require('../../../users/db')

describe('POST /courses/courses/:id/subjects', function () {
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
    title: 'Course1',
    'i-am-author': true,
    author: user1.email
  }
  let courseId1

  const subject1 = {
    title: 'Subject1',
    author: user1.email
  }

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
        .post('/courses/courses/' + course1.id + '/subjects')
        .send(subject1)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg);
          res.body.should.not.have.property('subject');
        });
    });
    
    it('Пользователь авторизован, но не преподаватель: отказ', function() {
      return agent
        .post('/users/users/' + userId1 + '/auth')
        .send({password: user1.password})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg);
          
          return agent
            .post('/courses/courses/' + courseId1 + '/subjects')
            .send(subject1)
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .then(res => {
              res.body.status.should.equal(false, res.body.msg);
              res.body.should.not.have.property('subject');
            });
        });
    });
    
    it('Пользователь авторизован и является преподавателем: успех.', function() {
      return rolesDB.assignRole(userId1, 'teacher')
        .then(() => {
          return agent
            .post('/courses/courses/' + courseId1 + '/subjects')
            .send(subject1)
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .then(res => {
              res.body.status.should.equal(true, res.body.msg);
              res.body.should.have.property('subject');
            })
        })
    })
    
    it('Не задана тема: отказ', function() {
      return agent
        .post('/courses/courses/' + courseId1 + '/subjects')
        .send({})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg)
        });
    });

    it('Пользователь преподаватель, но не автор курса: отказ', function() {
      return agent
        .delete('/users/users/' + userId1 + '/auth')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg);

          return rolesDB.assignRole(userId2, 'teacher')
            .then(() => {
              return agent
                .post('/users/users/' + userId2 + '/auth')
                .send({password: user2.password})
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                  res.body.status.should.equal(true, res.body.msg);
                  
                  return agent
                    .post('/courses/courses/' + courseId1 + '/subjects')
                    .send(subject1)
                    .set('X-Requested-With', 'XMLHttpRequest')
                    .expect('Content-Type', /application\/json/)
                    .expect(200)
                    .then(res => {
                      res.body.status.should.equal(false, res.body.msg);
                      res.body.should.not.have.property('subject');
                    });
                })
            })
        })
    })
  });
  
  context('Нет ни одного курса', function() {
    before(function() {
      return coursesDB.clear()
    })
    
    it('Попытка добавить к несуществующему курсу тему', function() {
      return agent
        .post('/courses/courses/719825791875/subjects')
        .send(subject1)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg);
          res.body.should.not.have.property('subject');
        });
    });
  })

  after(function() {
    return usersDB.clearUsers()
  })
})
