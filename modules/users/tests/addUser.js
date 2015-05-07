var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();
//var usersConst = require('../js/const');

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
            console.log(res.body.msg);
            res.body.status.should.equal(true);
            
            request
              .post('/users/login')
              .send({email: "admin1@testero", password: "admin1"})
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .end(function (err, res) {
                if (err) {
                  throw err;
                }
                console.log(res.body.msg);
                res.body.status.should.equal(true);
                
                agent.saveCookies(res);
                
                /*var req = request.post('/users/getMe');
                agent.attachCookies(req);
                  req
                    .set('X-Requested-With', 'XMLHttpRequest')
                  .expect('Content-Type', /application\/json/)
                  .expect(200)
                  .end(function(err, res) {
                    if (err) {
                      throw err;
                    }
                    console.log("/users/getMe " + res.body.msg);
                    res.body.status.should.equal(true);
                    done();
                  });*/
                done();
              });
          });
      });
      
      it('Возвращается успех и объект пользователя', function (done) {
        var data = {
          email: "user1@testero",
          password: "user1",
          passwordDuplicate: "user1",
          agreementAccepted: true
        };
        var req = request
          .post('/users/addUser');
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
            console.log(res.body.msg);
            res.body.status.should.equal(true);
            done();
          });
      });
    });
  });
});
