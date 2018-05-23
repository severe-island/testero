"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const supertest = require('supertest')

const coursesDB = require('../../db/courses')
const rolesDB = require('../../db/roles')
const usersDB = require('../../../users/db')

describe('POST /courses/courses', function () {
  let agent
  let app

  before(function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'tester-testing'
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
    })
  })

  describe('Добавление курсов (POST /courses/courses).', function() {
    var user1 = {
      email: 'user1@testero',
      password: 'user1',
      passwordDuplicate: 'user1'
    };

    before(function() {
      return coursesDB.clearCourses()
        .then(() => {
          return usersDB.registerUser(user1)
        })
        .then(data => {
          user1._id = data._id;
        })
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

  after(function() {
    return coursesDB.clearCourses()
      .then(() => {
        return usersDB.clearUsers()
      })
    })
})
