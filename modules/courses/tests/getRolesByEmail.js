"use strict"

const mongodb = require('mongodb')
const should = require('should')

var agent
var app
var coursesDB
var rolesDB
var usersDB

describe('Модуль courses.', function() {
  before(function(done) {
    const config = require('../../../config')
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'development'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    mongodb.MongoClient.connect(mongoUrl, (err, connection) => {
      if (err) {
        throw err
      }

      coursesDB = require('../db/courses')
      coursesDB.setup(connection)
      rolesDB = require('../db/roles')
      rolesDB.setup(connection)
      usersDB = require('../../users/db')
      usersDB.setup(connection)

      app = require('../../../app')(connection)

      const supertest = require('supertest')
      agent = supertest.agent(app)
      const cookieParser = require('cookie-parser')
      app.use(cookieParser())

      done()
    })
  })

  describe('Получение списка ролей по email (getRolesByEmail).', function() {
    before('Добавление тестового пользователя в БД.', function(done) {
      usersDB.registerUser({
        email: "admin@admin",
        password: "1234",
        isAdministrator: true,
        registeredBy: "admin@admin"
      }, function(err, newUser) {
        should.not.exist(err)
        done()
      });
    });       
    
    context('Пользователь не имеет ролей.', function() {
      it('Получено null', function(done) {
        agent
        .post('/courses/getRolesByEmail')
        .send({email: "admin@admin"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          should.not.exist(res.body.roles);
          done(); 
        });
      });
    });
    
    context('Пользователь имеет несколько ролей.', function() {
      before('Назначение нескольких ролей пользователю', function(done) {
        rolesDB.assignRole("admin@admin", "teacher", function(err) {
          should.not.exist(err);
          rolesDB.assignRole("admin@admin", "student", function(err) {
            should.not.exist(err);
            done();
          });
        });
      });
      
      it('Получен массив ["teacher", "student"]', function(done) {
        agent
        .post('/courses/getRolesByEmail')
        .send({email: "admin@admin"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          res.body.roles.should.containEql("student");
          res.body.roles.should.containEql("teacher");
          done(); 
        });
      });
      
      after('Очистка ролей после теста', function(done) {
        rolesDB.clearRoles(function(err) {
          should.not.exist(err);
          done();
        }); 
      });
    });
  })

  after(function(done) {
    usersDB.clearUsers(function() {
      done()
    })
  })
})
