"use strict"

const cookieParser = require('cookie-parser')
const supertest = require('supertest')

var agent
var app
var usersDB

describe('Модуль users', function() {
  before('Connect to database', function(done) {
    const mongodb = require('mongodb')

    const config = require('config')
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true}, (err, client) => {
      if (err) {
        throw err
      }

      const db = client.db(dbName)

      usersDB = require('../../db')
      usersDB.setup(db)

      app = require('../../../../app')(db)
      app.use(cookieParser())
      agent = supertest.agent(app)
      
      done()
    })
  })

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
    })
    
    /* after(function(done) {
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
    }); */
  })

  after(function() {
    return usersDB.clearUsers()
  })
})
