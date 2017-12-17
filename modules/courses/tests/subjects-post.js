"use strict"

const mongodb = require('mongodb')
const should = require('should')

var app
var agent
var coursesDB
var rolesDB
var usersDB

describe('Модуль courses::subjects', function () {
  var user1 = {
    email: 'user1@user1',
    password: 'user1',
    passwordDuplicate: 'user1'
  }

  before(function(done) {
    const config = require('config')
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'development'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    mongodb.MongoClient.connect(mongoUrl, (err, connection) => {
      if (err) {
        throw err
      }

      app = require('../../../app')(connection)

      const supertest = require('supertest')
      agent = supertest.agent(app)
      const cookieParser = require('cookie-parser')
      app.use(cookieParser())

      coursesDB = require('../db/courses')
      coursesDB.setup(connection)
      rolesDB = require('../db/roles')
      rolesDB.setup(connection)
      usersDB = require('../../users/db')
      usersDB.setup(connection)
      
      coursesDB.clearCourses(function() {
        usersDB.registerUser(user1, function() {
          done();
        });
      });
    })
  })
  
  var course1;
  var subject1 = {title: 'Subject1'};
  
  context('Зарегистрирован некий курс', function() {
    before(function(done) {
      coursesDB.add({title: 'Course1', 'i-am-author': true, author: user1.email}, function(err, data) {
        should.not.exist(err);
        course1 = data;
        subject1.course_id = data._id;
        done();
      });
    });
    
    it('Пользователь не авторизован: отказ', function(done) {
      agent
        .post('/courses/courses/' + course1._id + '/subjects')
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
            .post('/courses/courses/' + course1._id + '/subjects')
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
    
    it('Пользователь авторизован и является преподавателем: успех.', function(done) {
      rolesDB.assignRole(user1.email, 'teacher', function() {
        agent
          .post('/courses/courses/' + course1._id + '/subjects')
          .send(subject1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            res.body.status.should.equal(true, res.body.msg);
            res.body.should.have.property('subject');

            done();
          });
      });
    });
    
    it('Не задана тема: отказ', function(done) {
      agent
        .post('/courses/courses/' + course1._id + '/subjects')
        .send({})
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
  
  context('Нет ни одного курса', function() {
    before(function(done) {
      coursesDB.clearCourses(function() {
        done();
      });
    });
    
    it('Попытка добавить к несуществующему курсу тему', function(done) {
      agent
        .post('/courses/courses/719825791875/subjects')
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
  })

  after(function(done) {
    usersDB.clearUsers(function() {
      done()
    })
  })
})
