"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const supertest = require('supertest')

var agent
var app
var usersDB

describe('GET /users/users', function () {
  before('Connect to database.', function(done) {
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

  describe('The list of all users', function() {
    context('The list is empty', function() {
      it('Возвращается массив длины нуль', function() {
      return agent
        .get('/users/users/')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true);
          res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(0);
        });
      });
    });

    context('One user', function() {
      before(function() {
        let admin1 = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1"
        }

        return usersDB.registerUser(admin1)
      });
    
      it('Возвращается массив длиной единица', function(done) {
        agent
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
        agent
          .post('/users/users')
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
        agent
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
    
    after(function() {
      return usersDB.clearUsers()
    })
  });
  
  describe('Поиск пользователя по email (GET /users/users/?email=email)', function() {
    let user = {
      email: "user1@testero",
      password: "user1",
      passwordDuplicate: "user1",
      showEmail: true
    }
    
    before(function() {
      return usersDB.registerUser(user)
    })
    
    context('Пользователь существует', function() {
      it('Возвращается объект пользователя', function() {
        return agent
          .get('/users/users/?email=' + user.email)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg);
            res.body.user.should.have.property('email');
            res.body.user.email.should.equal(user.email);
          });
      });
    });
    
    context('Пользователь несуществует', function() {
      it('Возвращается неуспех', function(done) {
        agent
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
  
  after(function() {
    return usersDB.clearUsers()
  });
})
