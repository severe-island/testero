var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function() {
  describe('Вход (login)', function() {
    context('Пользователь существует и не авторизован', function() {
      it('Возвращается успех', function(done) {
        request
          .post('/users/login')
          .send({email: "user1@testero", password: "user1"})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            agent.saveCookies(res);
            
            console.log(res.body.msg);

            res.body.status.should.equal(true);

            done();
          });
      });
    });
  });
});
