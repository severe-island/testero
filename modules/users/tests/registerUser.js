var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function () {
  describe('Регистрация нового пользователя (registerUser)', function() {
    context('Пользователей ещё нет', function() {
      it('Возвращается отказ', function (done) {
        var data = {
          email: "user1@testero",
          password: "user1",
          passwordDuplicate: "user1",
          agreementAccepted: true
        };
        request
          .post('/users/registerUser')
          .send(data)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(false);
            
            done();
          });
      });
    });
    
    context('После добавления первого администратора', function () {
      before(function (done) {
        var data = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1",
          agreementAccepted: true
        };
        request
          .post('/users/addAdmin')
          .send(data)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            agent.saveCookies(res);
            
            res.body.status.should.equal(true);
                
            done();
          });
      });
      
      it('Возвращается успех и объект пользователя', function (done) {
        var data = {
          email: "user1@testero",
          password: "user1",
          passwordDuplicate: "user1",
          isAdministrator: false,
          agreementAccepted: true
        };
        var req = request.post('/users/registerUser');
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
            res.body.status.should.equal(true);
            res.body.should.have.property('level');
            res.body.level.should.equal("success");
            res.body.should.have.property('user');
            res.body.user.should.have.property('email');
            res.body.user.should.have.property('isAdministrator');
            res.body.user.should.have.property('showEmail');
            res.body.user.should.have.property('created_at');
            res.body.user.should.have.property('updated_at');
            
            done();
          });
      });
    });
    
    context('Попытка добавления пользователя не администратором', function() {
      before(function(done) {
        var user = {email: "user1@testero", password: "user1"};
        var req = request.post('/users/login');
        agent.attachCookies(req);
        req
          .send(user)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            agent.saveCookies(res);
            
            res.body.status.should.equal(true);
            
            done();
          });
      });
      
      it('Возвращается отказ', function(done) {
        var data = {
          email: "user2@testero",
          password: "user2",
          passwordDuplicate: "user2",
          agreementAccepted: true
        };
        var req = request.post('/users/registerUser');
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
            
            res.body.status.should.equal(false);
            
            done();
          });
      });
    });
    
    after(function(done) {
      var req = request.post('/users/clearUsers');
      agent.attachCookies(req);
      req
        .send({email: "user1@testero"})
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
