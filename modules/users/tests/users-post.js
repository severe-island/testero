var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();
var usersDB = require('../db/index');

describe('Модуль users', function () {
  describe('Регистрация нового пользователя (POST /users/users)', function() {
    context('Пользователей ещё нет', function() {
      it('Возвращается успех, пользователь зарегистрирован администратором', function (done) {
        var data = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1",
          agreementAccepted: true
        };
        request
          .post('/users/users')
          .send(data)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(true, res.body.msg);
            res.body.user.isAdministrator.should.equal(true, res.body.msg);
            
            done();
          });
      });
    });
    
    context('Попытка зарегистрировать ещё одного такого же пользователя', function () {
      it('Возвращается отказ', function (done) {
        var admin1 = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1",
          agreementAccepted: true
        };
        request
          .post('/users/users')
          .send(admin1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            agent.saveCookies(res);
            
            res.body.status.should.equal(false, res.body.msg);
                
            done();
          });
      });
    });

    context('Регистрация ещё одного пользователя', function() {
      it('Возвращается успех и объект простого пользователя', function (done) {
        var data = {
          email: "user1@testero",
          password: "user1",
          passwordDuplicate: "user1",
          isAdministrator: false,
          agreementAccepted: true
        };
        var req = request.post('/users/users');
        agent.attachCookies(req);
        req
          .send(data)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            res.body.should.have.property('status');
            res.body.status.should.equal(true, res.body.msg);
            res.body.should.have.property('level');
            res.body.level.should.equal("success");
            res.body.should.have.property('user');
            res.body.user.should.have.property('email');
            //res.body.user.should.not.have.property('isAdministrator');
            res.body.user.isAdministrator.should.equal(false, res.body.msg);
            res.body.user.should.have.property('showEmail');
            res.body.user.should.have.property('created_at');
            res.body.user.should.have.property('updated_at');
            
            done();
          });
      });
    });
    
    context('Попытка добавления пользователя с не указанным email', function() {
      it('Возвращается отказ', function(done) {
        var data = {
          //email: "user2@testero",
          password: "user2",
          passwordDuplicate: "user2",
          agreementAccepted: true
        };
        var req = request.post('/users/users');
        agent.attachCookies(req);
        req
          .send(data)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            agent.saveCookies(res);
            
            res.body.status.should.equal(false, res.body.msg);
            
            done();
          });
      });
    });
    
    after(function(done) {
      usersDB.clearUsers(function() {
        done();
      });
    });
  });
});
