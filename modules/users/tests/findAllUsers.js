var request = require('supertest');
var app = require('../../../app');
var usersConst = require('../js/const');

describe('Модуль users', function () {
  describe('Список всех пользователей (findAllUsers)', function() {
    context('Список пуст', function() {
      it('', function (done) {
      request(app)
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
        var user = {
          email: "user1@testero",
          password: "user1",
          passwordDuplicate: "user1"
        };
        request(app)
          .post('/users/signup')
          .send(user)
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
    
      it('', function(done) {
        request(app)
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
        var user = {
          email: "user2@testero",
          password: "user2",
          passwordDuplicate: "user2"
        };
        request(app)
          .post('/users/signup')
          .send(user)
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

      it('', function(done) {
        request(app)
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
});
