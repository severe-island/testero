"use strict"

var agent
var app
var usersDB

describe('Модуль users', function () {
  before('Connect to database', function(done) {
    const mongodb = require('mongodb')

    const config = require('config')
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'development'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true}, (err, client) => {
      if (err) {
        throw err
      }

      const db = client.db(dbName)

      usersDB = require('../db')
      usersDB.setup(db)

      app = require('../../../app')(db)

      const supertest = require('supertest')
      agent = supertest.agent(app)
      const cookieParser = require('cookie-parser')
      app.use(cookieParser())

      done()
    })
  })

  describe('Регистрация нового пользователя (POST /users/users)', function() {
    context('Пользователей ещё нет', function() {
      it('Возвращается успех, пользователь зарегистрирован администратором', function (done) {
        var data = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1",
          agreementAccepted: true
        };
        agent
          .post('/users/users')
          .send(data)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(true, res.body.msg);
            res.body.user.isAdministrator.should.equal(true, res.body.msg);
            
            done();
          });
      });
    });
    
    context('Попытка зарегистрировать ещё одного такого же пользователя', function () {
      it('Возвращается отказ', function (done) {
        var admin1 = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1",
          agreementAccepted: true
        };
        agent
          .post('/users/users')
          .send(admin1)
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

    context('Регистрация ещё одного пользователя', function() {
      it('Возвращается успех и объект простого пользователя', function (done) {
        var data = {
          email: "user1@testero",
          password: "user1",
          passwordDuplicate: "user1",
          isAdministrator: false,
          agreementAccepted: true
        };
        agent
          .post('/users/users')
          .send(data)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            res.body.should.have.property('status');
            res.body.status.should.equal(true, res.body.msg);
            res.body.should.have.property('level');
            res.body.level.should.equal("success");
            res.body.should.have.property('user');
            res.body.user.should.have.property('email');
            res.body.user.isAdministrator.should.equal(false, res.body.msg);
            res.body.user.should.have.property('showEmail');
            res.body.user.should.have.property('created_at');
            res.body.user.should.have.property('updated_at');
            
            done();
          });
      });
    });
    
    context('Попытка добавления пользователя с не указанным email', function() {
      it('Возвращается отказ', function(done) {
        var data = {
          //email: "user2@testero",
          password: "user2",
          passwordDuplicate: "user2",
          agreementAccepted: true
        };
        agent
          .post('/users/users')
          .send(data)
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
    })
  })

  after(function(done) {
    usersDB.clearUsers(function() {
      done();
    });
  })
})
