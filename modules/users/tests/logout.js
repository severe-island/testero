var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function() {
  describe('Выход из системы (logout)', function() {
    context('Пользователь не был авторизован', function() {
      it('Возвращается успех', function(done) {
        request
          .post('/users/logout')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            res.body.status.should.equal(true, res.body.msg);

            done();
          });
      });
    });
  });
});
