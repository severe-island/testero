var request = require('supertest');
var app = require('../../../app');

describe('Модуль users:', function () {
  describe('Список всех пользователей:', function() {
    it('Список пуст:', function (done) {
      request(app)
        .post('/users/findAllUsers')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.status.should.equal(true);
          res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(0);
          done();
        });
    });
    
    it('Добавлен первый пользователь:', function() {
      request(app)
        .post('/users/signup')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.body.status.should.equal(true);
          
          request(app)
            .post('/users/findAllUsers')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              if (err) {
                throw err;
              }
              res.body.status.should.equal(true);
              res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(0);
              done();
          });
          
          done();
      });
    });
    
    it('Добавлен второй пользователь:', function() {
      request(app)
        .post('/users/signup')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.body.status.should.equal(true);
          
          request(app)
            .post('/users/findAllUsers')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              if (err) {
                throw err;
              }
              res.body.status.should.equal(true);
              res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(0);
              done();
          });
          
          done();
      });
    });
  });
});
