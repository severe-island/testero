var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();
var usersDB = require('../db/index');

describe('Модуль users', function () {
  describe('Список всех пользователей (GET /users/users/)', function() {
    context('Список пуст', function() {
      it('Возвращается массив длины нуль', function (done) {
      request
        .get('/users/users/')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true);
          res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(0);
          
          done();
        });
      });
    });

    context('Один пользователь', function() {
      before(function(done) {
        var admin1 = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1"
        };
        request
          .post('/users/users')
          .send(admin1)
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
    
      it('Возвращается массив длиной единица', function(done) {
        request
          .get('/users/users/')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(true);
            res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(1);
            
            done();
        });
      });
    });

    context('Два пользователя', function() {
      before(function(done) {
        var user1 = {
          email: "user1@testero",
          password: "user1",
          passwordDuplicate: "user1"
        };
        var req = request.post('/users/users');
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
            
            res.body.status.should.equal(true, res.body.msg);
            
            done();
        });
      });

      it('Возвращается массив длиной два', function(done) {
        request
          .get('/users/users/')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(true);
            res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(2);
            
            done();
        });
      });
    });
    
    after(function(done) {
      usersDB.clearUsers(function() {
        done();
      });
    });
  });
  
  describe('Поиск пользователя по email (GET /users/users/?email=email)', function() {
    var user = {
      email: "user1@testero",
      password: "user1",
      passwordDuplicate: "user1",
      showEmail: true
    };
    
    before(function(done) {
      usersDB.registerUser(user, function(err, newUser) {
        done();
      });
    });
    
    context('Пользователь существует', function() {
      it('Возвращается объект пользователя', function(done) {
        request
          .get('/users/users/?email=' + user.email)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(true, res.body.msg);
            res.body.user.should.have.property('email');
            res.body.user.email.should.equal(user.email);
            
            done();
          });
      });
    });
    
    context('Пользователь несуществует', function() {
      it('Возвращается неуспех', function(done) {
        request
          .get('/users/users/?email=user2@testero')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(false, res.body.msg);
            res.body.should.not.have.property('user');
            
            done();
          });
      });
    });
  });
  
  after(function(done) {
    usersDB.clearUsers(function() {
      done();
    });
  });
});
