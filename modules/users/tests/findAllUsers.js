var request = require('supertest');
var app = require('../../../app');
var userConst = require('../js/const');

describe('Модуль users:', function () {
  describe('Список всех пользователей:', function() {
    it('Список пуст:', function (done) {
      request(app)
        .post('/users/findAllUsers')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.status.should.equal(true);
          res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(0);
          done();
          console.log(userConst.Messages.findAllUsers[userConst.ErrorCodes.findAllUsers.SUCCESSFUL]);
        });
    });
    
    it('Добавлен первый пользователь:', function() {
      var user = {
        email: "user1@testero",
        password: "user1",
        passwordDuplicate: "user1"
      };
      request(app)
        .post('/users/signup')
        .send(user)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.body.status.should.equal(true);
          
          request(app)
            .post('/users/findAllUsers')
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
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
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.body.status.should.equal(true);
          
          request(app)
            .post('/users/findAllUsers')
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
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
