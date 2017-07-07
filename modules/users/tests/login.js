const app = require('../../../app');
const request = require('supertest')(app);
const supertest = require('supertest')
const agent = supertest.agent(app)
const superagent = require('superagent');
const cookieParser = require('cookie-parser')

app.use(cookieParser())

describe('Модуль users', function() {
  describe('Вход (login)', function() {
    before(function(done) {
      var admin1 = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1"
        };
        agent
          .post('/users/users')
          .send(admin1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(true, res.body.msg);
            
            done();
          });
    });
    
    context('Вход под администратором', function() {
      it('Возвращается успех. Администратор после регистрации уже в системе', function(done) {
        agent
          .post('/users/login')
          .send({email: "admin1@testero", password: "admin1"})
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
    
    context('Попытка входа до выхода из системы', function() {
      it('Возвращается отказ', function(done) {
        agent
          .post('/users/login')
          .send({email: "user1@testero", password: "user1"})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            res.body.status.should.equal(false, res.body.msg);

            done();
          });
      });
    });
    
    context('Пользователь существует и не авторизован', function() {
      
    });
    
    after(function(done) {
      agent
        .delete('/users/users')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);

          done();
      });
    });
  });
});
