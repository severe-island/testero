var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function() {
  describe('Вход (login)', function() {
    before(function(done) {
      var admin1 = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1"
        };
        var req = request.post('/users/users');
        agent.attachCookies(req);
        req
          .send(admin1)
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
    
    context('Вход под администратором', function() {
      it('Возвращается успех. Администратор после регистрации уже в системе', function(done) {
        var req = request.post('/users/login');
        agent.attachCookies(req);
        req
          .send({email: "admin1@testero", password: "admin1"})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            agent.saveCookies(res);

            res.body.status.should.equal(true, res.body.msg);

            done();
          });
      });
    });
    
    context('Попытка входа до выхода из системы', function() {
      it('Возвращается отказ', function(done) {
        var req = request.post('/users/login');
        agent.attachCookies(req);
        req
          .send({email: "user1@testero", password: "user1"})
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
    
    context('Пользователь существует и не авторизован', function() {
      
    });
    
    after(function(done) {
      var req = request.post('/users/clearUsers');
      agent.attachCookies(req);
      req
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          agent.saveCookies(res);
          
          res.body.status.should.equal(true);

          done();
      });
    });
  });
});
