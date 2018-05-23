"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const should = require('should')
const supertest = require('supertest')

const coursesDB = require('../../db/courses')
const rolesDB = require('../../db/roles')
const usersDB = require('../../../users/db')

describe('/courses/getRolesByEmail', function() {
  let agent
  let app

  before(function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    return mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true})
      .then(client => {
        const db = client.db(dbName)
    
        coursesDB.setup(db)
        rolesDB.setup(db)
        usersDB.setup(db)

        app = require('../../../../app')(db)
        app.use(cookieParser())

        agent = supertest.agent(app)

        return coursesDB.clearCourses()
          .then(() => {
            rolesDB.clearRoles()
          })
          .then(() => {
            usersDB.clearUsers()
          })
      })
  })

  describe('Получение списка ролей по email (getRolesByEmail).', function() {
    before('Добавление тестового пользователя в БД.', function() {
      return usersDB.registerUser({
        email: "admin@admin",
        password: "1234",
        isAdministrator: true,
        registeredBy: "admin@admin"
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
      
      after('Очистка ролей после теста', function() {
        return rolesDB.clearRoles()
      });
    });
  })

  after(function() {
    return usersDB.clearUsers()
  })
})
