const app = require('../../../app');
const request = require('supertest')(app);
const supertest = require('supertest')
const agent = supertest.agent(app)
const superagent = require('superagent');
const cookieParser = require('cookie-parser')

var coursesDB = require('../db/courses');
var usersDB = require('../../users/db');
var rolesDB = require('../db/roles');

app.use(cookieParser())

describe('Модуль courses::subjects', function () {
  var user1 = {
    email: 'user1@testero',
    password: 'user1',
    passwordDuplicate: 'user1'
  };
  
  before(function(done) {
    coursesDB.clearCourses(function() {
      usersDB.registerUser(user1, function() {
        done();
      });
    });
  });
  
  var course1;
  var subject1 = {title: 'Subject1'};
  
  context('Зарегистрирован некий курс', function() {
    before(function(done) {
      coursesDB.add({title: 'Course1', 'i-am-author': true, author: user1.email}, function(err, data) {
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
  });
});
