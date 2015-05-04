var request = require('supertest')
var app = require('../../../app')

describe('Проверка модуля users.', function () {
  it('Получить список всех пользователей.', function (done) {
    request(app)
    .post('/users/findAllUsers')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err,res) {
      if (err) {
        throw err;
      }
      res.body.status.should.equal(true);
      done();
    });
  })
})