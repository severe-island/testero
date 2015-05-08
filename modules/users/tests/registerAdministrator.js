var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function() {
  describe('Регистрация первого администратора (registerAdministrator)', function() {
    context('Ни одного администратора системы ещё нет', function() {
      it('Возвращается успех и объект пользователя', function(done) {
        var admin1 = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1"
        };
        request
          .post('/users/registerAdministrator')
          .send(admin1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            agent.saveCookies(res);
            
            res.body.should.have.property('status');
            res.body.status.should.equal(true, res.body.msg);
            res.body.should.have.property('level');
            res.body.level.should.equal("success");
            
            done();
        });
      });
    });
    
    context('Попытка зарегистрировать ещё одного администратора', function() {
      before(function(done) {
        var req = request.post('/users/logout');
        agent.attachCookies(req);
        req
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
      
      it('Возвращается отказ', function(done) {
        var admin2 = {
          email: "admin2@testero",
          password: "admin2",
          passwordDuplicate: "admin2"
        };
        var req = request.post('/users/registerAdministrator');
        agent.attachCookies(req);
        req
          .send(admin2)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            agent.saveCookies(res);
            
            res.body.should.have.property('status');
            res.body.status.should.equal(false, res.body.msg);
            res.body.should.have.property('level');
            
            done();
        });
      });
    });
    
    after(function(done) {
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

          var req = request.post('/users/clearUsers');
          agent.attachCookies(req);
          req
            .set('X-Requested-With', 'XMLHttpRequest')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .end(function (err, res) {
              if (err) {
                throw err;
              }

              res.body.status.should.equal(true);

              done();
            });
        });
    });
  });
});
