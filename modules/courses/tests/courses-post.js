var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();
var coursesDB = require('../db/courses');
var usersDB = require('../../users/db');
var rolesDB = require('../db/roles');

describe('Модуль courses', function () {
  before(function(done) {
    coursesDB.clearCourses(function() {
      done();
    });
  });
  
  var course1 = {title: 'Course1', 'i-am-author': true};
  
  context('Попытка добавить курс не авторизованным пользователем', function() {
    it('Возвращается неуспех.', function(done) {
      request
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
  
  var user1 = {
    email: 'user1@testero',
    password: 'user1',
    passwordDuplicate: 'user1'
  };
  
  context('Попытка добавить курс не преподавателем', function() {
    before(function(done) {
      usersDB.registerUser(user1, function() {
        var req = request.post('/users/login');
        agent.attachCookies(req);
        req
          .send(user1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }

            agent.saveCookies(res);
            
            res.body.status.should.equal(true, res.body.msg);
            
            done();
          });
      });
    });
    
    it('Возвращается неуспех.', function(done) {
      request
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
      var req = request.post('/courses/courses/');
      agent.attachCookies(req);
      req
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
      var req = request.post('/courses/courses/');
      agent.attachCookies(req);
      req
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
  
  after(function(done) {
    coursesDB.clearCourses(function() {
      done();
    });
  });
});
