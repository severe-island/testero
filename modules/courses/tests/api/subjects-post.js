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
  let user1 = {
    email: 'user1@user1',
    password: 'user1',
    passwordDuplicate: 'user1'
  }
  let userId1

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
      
        return coursesDB.clearCourses()
          .then(() => {
            return usersDB.registerUser(user1)
            .then(data => {
              userId1 = data.id
            })
          })
      })
  })
  
  var course1;
  var subject1 = {title: 'Subject1'};
  
  context('Зарегистрирован некий курс', function() {
    before(function() {
      return coursesDB.add({title: 'Course1', 'i-am-author': true, author: user1.email})
        .then(data => {
          course1 = data;
          subject1.course_id = data.id;
      });
    });

    it('Пользователь не авторизован: отказ', function(done) {
      agent
        .post('/courses/courses/' + course1.id + '/subjects')
        .send(subject1)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(false, res.body.msg);
          res.body.should.not.have.property('subject');
          
          done();
        });
    });
    
    it('Пользователь авторизован, но не преподаватель: отказ', function(done) {
      agent
        .post('/users/login')
        .send(user1)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          res.body.status.should.equal(true, res.body.msg);
          
          agent
            .post('/courses/courses/' + course1.id + '/subjects')
            .send(subject1)
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .end(function (err, res) {
              if (err) {
                throw err;
              }

              res.body.status.should.equal(false, res.body.msg);
              res.body.should.not.have.property('subject');

              done();
            });
        });
    });
    
    it('Пользователь авторизован и является преподавателем: успех.', function() {
      return rolesDB.assignRole(userId1, 'teacher')
        .then(() => {
          return agent
            .post('/courses/courses/' + course1.id + '/subjects')
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
        .post('/courses/courses/' + course1.id + '/subjects')
        .send({})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(false, res.body.msg)
          res.body.should.not.have.property('subject')
        });
    });
  });
  
  context('Нет ни одного курса', function() {
    before(function() {
      return coursesDB.clearCourses()
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
