var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function() {
  describe('Выход из системы (logout)', function() {
    context('Пользователь не был авторизован', function() {
      it('Возвращается успех', function(done) {
        var req = request.get('/users/logout');
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
    });
  });
});
