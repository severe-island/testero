"use strict"

const mongodb = require('mongodb')

var agent
var app
var coursesDB
var rolesDB
var usersDB

describe('Модуль courses.', function () {
  before(function(done) {
    const config = require('../../../config')
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

      coursesDB = require('../db/courses')
      coursesDB.setup(connection)
      rolesDB = require('../db/roles')
      rolesDB.setup(connection)
      usersDB = require('../../users/db')
      usersDB.setup(connection)

      app.use(cookieParser())

      done()
    })
  })

  describe('Добавление курсов (POST /courses/courses).', function() {
    var user1 = {
      email: 'user1@testero',
      password: 'user1',
      passwordDuplicate: 'user1'
    };

    before(function(done) {
      coursesDB.clearCourses(function() {
        usersDB.registerUser(user1, function(err, data) {
          user1._id = data._id;
          done();
        });
      });
    });

    var course1 = {title: 'Course1', 'i-am-author': true};

    context('Попытка добавить курс не авторизованным пользователем.', function() {
      it('Возвращается неуспех.', function(done) {
        agent
          .post('/courses/courses/')
          .send(course1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            res.body.status.should.equal(false, res.body.msg);
            res.body.should.not.have.property('course');

            done();
          });
      });
    });


    context('Попытка добавить курс не преподавателем.', function() {
      before(function(done) {
        agent
          .post('/users/users/' + user1._id + '/auth')
          .send(user1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }

            res.body.status.should.equal(true, res.body.msg);

            done();
          });
      });

      it('Возвращается неуспех.', function(done) {
        agent
          .post('/courses/courses/')
          .send(course1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            res.body.status.should.equal(false, res.body.msg);
            res.body.should.not.have.property('course');

            done();
          });
      });
    });

    context('Добавление курса преподавателем', function() {
      before(function(done) {
        rolesDB.assignRole(user1.email, 'teacher', function() {
          done();
        });
      });

      it('Возвращается успех.', function(done) {
        agent
          .post('/courses/courses/')
          .send(course1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            res.body.status.should.equal(true, res.body.msg);
            res.body.should.have.property('course');
            res.body.course.should.have.property('title');
            res.body.course.title.should.equal('Course1');
            res.body.course.should.have.property('authors');
            res.body.course.authors.should.have.lengthOf(1);
            res.body.course.authors[0].should.equal(user1.email);

            done();
          });
      });
    });

    var course2 = {title: 'Course2', 'i-am-author': false};

    context('Добавление ещё одного курса преподавателем', function() {
      it('Возвращается успех.', function(done) {
        agent
          .post('/courses/courses/')
          .send(course2)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            res.body.status.should.equal(true, res.body.msg);
            res.body.should.have.property('course');
            res.body.course.should.have.property('title');
            res.body.course.title.should.equal('Course2');
            res.body.course.should.not.have.property('authors');

            done();
          });
      });
    });
  })

  after(function(done) {
    coursesDB.clearCourses(function() {
      usersDB.clearUsers(function() {
        done()
      })
    })
  })
})
