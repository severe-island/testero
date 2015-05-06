var request = require('supertest');
var app = require('../../../app');
var usersConst = require('../js/const');

describe('Модуль users', function () {
  describe('Добавление пользователя', function() {
    context('Пользователей ещё нет', function() {
      it('Возвращается отказ', function (done) {
        var data = {
          email: "user1@testero",
          password: "user1",
          passwordDuplicate: "user1",
          agreementAccepted: true
        };
        request(app)
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
  });
});
