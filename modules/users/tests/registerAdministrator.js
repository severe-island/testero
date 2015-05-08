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
            res.body.should.have.property('user');
            res.body.user.should.have.property('email');
            res.body.user.should.have.property('isAdministrator');
            res.body.level.should.equal(true);
            res.body.user.should.have.property('showEmail');
            res.body.user.should.have.property('created_at');
            res.body.user.should.have.property('updated_at');
            
            done();
        });
      });
    });
  });
});
