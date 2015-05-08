var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function () {
  describe('Список всех пользователей (findAllUsers)', function() {
    context('Список пуст', function() {
      it('Возвращается массив длины нуль', function (done) {
      request
        .post('/users/findAllUsers')
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
          .post('/users/addAdmin')
          .send(admin1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            agent.saveCookies(res);
            console.log(res.body.msg);
            res.body.status.should.equal(true);
            
            done();
        });
      });
    
      it('Возвращается массив длиной единица', function(done) {
        request
          .post('/users/findAllUsers')
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
        var req = request.post('/users/registerUser');
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
            
            res.body.status.should.equal(true);
            
            done();
        });
      });

      it('Возвращается массив длиной два', function(done) {
        request
          .post('/users/findAllUsers')
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
  });
  
  after(function(done) {
    var req = request.post('/users/clearUsers');
    agent.attachCookies(req);
    req
      .set('X-Requested-With', 'XMLHttpRequest')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.body.status.should.equal(true);
        done();
    });
  });
});
