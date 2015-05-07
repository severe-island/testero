var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function () {
  describe('Добавление пользователя (addUser)', function() {
    context('Пользователей ещё нет', function() {
      it('Возвращается отказ', function (done) {
        var data = {
          email: "user1@testero",
          password: "user1",
          passwordDuplicate: "user1",
          agreementAccepted: true
        };
        request
          .post('/users/addUser')
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
          agreementAccepted: true
        };
        var req = request.post('/users/addUser');
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
      
      after(function(done) {
        var req = request.post('/users/removeUser');
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
            
            var req = request.post('/users/removeUser');
            agent.attachCookies(req);
            req
              .send({email: "admin1@testero"})
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
});
