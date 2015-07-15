var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();
var coursesDB = require('../db/courses');

describe('Модуль courses', function () {
  before(function(done) {
    coursesDB.clearCourses(function() {
      done();
    });
  });
  
  describe('Список всех курсов (GET /courses/courses)', function() {
    context('Список пуст', function() {
      it('Возвращается массив длины нуль', function (done) {
        request
        .get('/courses/courses/')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);
          res.body.courses.should.be.an.instanceOf(Array).and.have.lengthOf(0);
          
          done();
        });
      });
    });
    
    context('В списке один курс', function() {
      before(function(done) {
        coursesDB.addCourse('Первый курс', null, function() {
          done();
        });
      });
      
      it('Возвращается массив длины единица', function (done) {
        request
        .get('/courses/courses/')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);
          res.body.courses.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          res.body.courses[0].title.should.equal('Первый курс', res.body.msg);
          
          done();
        });
      });
    });
    
    context('В списке два курса', function() {
      before(function(done) {
        coursesDB.addCourse('Второй курс', null, function() {
          done();
        });
      });
      
      it('Возвращается массив длины два', function (done) {
        request
        .get('/courses/courses/')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);
          res.body.courses.should.be.an.instanceOf(Array).and.have.lengthOf(2);
          res.body.courses[0].title.should.equal('Первый курс', res.body.msg);
          res.body.courses[1].title.should.equal('Второй курс', res.body.msg);
          
          done();
        });
      });
    });
  });
  
  after(function(done) {
    coursesDB.clearCourses(function() {
      done();
    });
  });
});
