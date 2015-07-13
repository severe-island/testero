var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function() {
  describe('Получение информации о самом себе (getMe)', function() {
    context('Пользователь не авторизован', function() {
      it('Возвращается отказ', function(done) {
        var req = request.get('/users/getMe');
        agent.attachCookies(req);
        req
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
          
            res.body.status.should.equal(false);
          
            done();
          });
      });
    });
  });
});
