const app = require('../../../app');
const request = require('supertest')(app);
const supertest = require('supertest')
const agent = supertest.agent(app)
const superagent = require('superagent');
const cookieParser = require('cookie-parser')

var usersDB = require('../db/');

app.use(cookieParser())

describe('Модуль users::auth.', function() {
  var user1 = {email: 'user1@testero', password: 'user1', passwordDuplicate: 'user1'};
  var id1;
  
  before(function(done) {
    usersDB.registerUser(user1, function(err, data) {
      id1 = data._id;
      done();
    });
  });
  
  context('Проверка авторизованности пользователя.', function() {
    it('Пользователь не авторизован.', function(done) {
      agent
        .get('/users/users/' + id1 + '/auth')
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
    
    it('Попытка авторизации без указания пароля.', function(done) {
      agent
        .post('/users/users/' + id1 + '/auth')
        .send({})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          res.body.status.should.equal(false, res.body.msg);

          done();
        });
    });
    
    it('Пользователь авторизовался.', function(done) {
      agent
        .post('/users/users/' + id1 + '/auth')
        .send({password: user1.password})
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
    
    it('Повторная авторизация.', function(done) {
      agent
        .post('/users/users/' + id1 + '/auth')
        .send(user1)
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
    
    it('Пользователь авторизован.', function(done) {
      agent
        .get('/users/users/' + id1 + '/auth')
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
    
    it('Прекращение авторизации.', function(done) {
      agent
        .delete('/users/users/' + id1 + '/auth')
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
    
    it('Повторное прекращение авторизации.', function(done) {
      agent
        .delete('/users/users/' + id1 + '/auth')
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
    
    it('Пользователь не авторизован.', function(done) {
      agent
        .get('/users/users/' + id1 + '/auth')
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
});
