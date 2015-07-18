var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();
var usersDB = require('../db/');

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
      var req = request.get('/users/users/' + id1 + '/auth');
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
          
          res.body.status.should.equal(false, res.body.msg);
          
          done();
        });
    });
    
    it('Попытка авторизации без указания пароля.', function(done) {
      var req = request.post('/users/users/' + id1 + '/auth');
      agent.attachCookies(req);
      req
        .send({})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          agent.saveCookies(res);

          res.body.status.should.equal(false, res.body.msg);

          done();
        });
    });
    
    it('Пользователь авторизовался.', function(done) {
      var req = request.post('/users/users/' + id1 + '/auth');
      agent.attachCookies(req);
      req
        .send({password: user1.password})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          agent.saveCookies(res);

          res.body.status.should.equal(true, res.body.msg);

          done();
        });
    });
    
    it('Повторная авторизация.', function(done) {
      var req = request.post('/users/users/' + id1 + '/auth');
      agent.attachCookies(req);
      req
        .send(user1)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            throw err;
          }

          agent.saveCookies(res);

          res.body.status.should.equal(true, res.body.msg);

          done();
        });
    });
    
    it('Пользователь авторизован.', function(done) {
      var req = request.get('/users/users/' + id1 + '/auth');
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
    
    it('Прекращение авторизации.', function(done) {
      var req = request.delete('/users/users/' + id1 + '/auth');
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
    
    it('Повторное прекращение авторизации.', function(done) {
      var req = request.delete('/users/users/' + id1 + '/auth');
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
    
    it('Пользователь не авторизован.', function(done) {
      var req = request.get('/users/users/' + id1 + '/auth');
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
          
          res.body.status.should.equal(false, res.body.msg);
          
          done();
        });
    });
  });
});
