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

      coursesDB = require('../db/courses')
      coursesDB.setup(db)
      rolesDB = require('../db/roles')
      rolesDB.setup(db)
      usersDB = require('../../users/db')
      usersDB.setup(db)

      app = require('../../../app')(db)

      const supertest = require('supertest')
      agent = supertest.agent(app)
      const cookieParser = require('cookie-parser')
      app.use(cookieParser())

      done()
    })
  })

  describe('Назначение роли (assignRole).', function() {
    let adminId;
    let user1Id;
    before('Добавление необходимых пользователей в БД.', function(done) {
      usersDB.registerUser({
        email: "admin@admin",
        password: "admin",
        isAdministrator: true,
        registeredBy: "admin@admin"
      }, function(err, admin) {
        adminId = admin._id
        should.not.exist(err);
        usersDB.registerUser({
          email: "user1@user1",
          password: "user1",
          isAdministrator: false,
          registeredBy: "admin@admin"
        }, function(err, user1) {
          user1Id = user1._id
          should.not.exist(err);
          usersDB.registerUser({
            email: "user2@user2",
            password: "user2",
            isAdministrator: false,
            registeredBy: "admin@admin"
          }, function(err, newUser) { 
            should.not.exist(err);
            done()
          });
        });
      });
    });       
    
    context('Назначение роли teacher администратором.', function() {
      before('Заход под именем администратора.', function(done) {
        agent
        .post('/users/login')
        .send({email: "admin@admin", password: "admin"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается успех. user1 имеет роль teacher.', function(done) {
        agent
        .post('/courses/assignRole')
        .send({email: "user1@user1", role: 'teacher'})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg)
          rolesDB.getRolesByEmail("user1@user1", function(err, roles) {
            should.not.exist(err);
            roles.should.containEql('teacher');

            done();
          });
        });
      });

      after(function(done) {
        agent
        .delete('/users/users/' + adminId + '/auth')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err)

          res.body.status.should.equal(true, res.body.msg)

          done()
        })
      })
    });
    
    context('Назначение роли teacher другим teacher.', function() {
      before('Назначение на user1 роли teacher. Вход под именем user1.', function(done) {
        rolesDB.assignRole("user1@user1", "teacher", function(err) {
          should.not.exist(err);

          agent
          .post('/users/login')
          .send({email: "user1@user1", password: "user1"})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.status.should.equal(true, res.body.msg);
            done(); 
          });
        });
      });
      
      it('Возвращается успех. user2 имеет роль teacher.', function(done) {
        agent
        .post('/courses/assignRole')
        .send({email: "user2@user2", role: 'teacher'})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          rolesDB.getRolesByEmail("user2@user2", function(err, roles) {
            should.not.exist(err);
            roles.should.containEql('teacher');
            done();
          }); 
        });
      });
    });
    
    context('Назначение роли teacher пользователем без ролей.', function() {
      before('Вход под именем user1.', function(done) {
        agent
        .post('/users/login')
        .send({email: "user1@user1", password: "1234"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается отказ. user2 не получает роль teacher.', function(done) {
        agent
        .post('/courses/assignRole')
        .send({email: "user2@user2", role: 'teacher'})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(false, res.body.msg);
          rolesDB.getRolesByEmail("user2@user2", function(err, roles) {
            should.not.exist(err);
            should.not.exist(roles);
            done();
          }); 
        });
      });
    });
    
    context('Назначение роли teacher пользователем с ролью student.', function() {
      before('Назначение user1 роли student. Вход под именем user1.', function(done) {
        rolesDB.assignRole("user1@user1", "student", function(err) {
          should.not.exist(err);
          agent
          .post('/users/login')
          .send({email: "user1@user1", password: "1234"})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.status.should.equal(true, res.body.msg);
            done(); 
          });
        });
      });
      
      it('Возвращается отказ. user2 не получает роль teacher.', function(done) {
        agent.post('/courses/assignRole')
        .send({email: "user2@user2", role: 'teacher'})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(false, res.body.msg);
          rolesDB.getRolesByEmail("user2@user2", function(err, roles) {
            should.not.exist(err);
            should.not.exist(roles);
            done();
          }); 
        });
      });

      after(function(done) {
        agent
        .delete('/users/users/' + adminId + '/auth')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err)

          res.body.status.should.equal(true, res.body.msg);

          done()
        })
      })
    });
    
    context('Назначение роли student администратором.', function() {
      before('Вход под именем администратора.', function(done) {
        agent
        .post('/users/login')
        .send({email: "admin@admin", password: "admin"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается успех. user2 получил роль student.', function(done) {
        agent
        .post('/courses/assignRole')
        .send({email: "user2@user2", role: 'student'})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          rolesDB.getRolesByEmail("user2@user2", function(err, roles) {
            should.not.exist(err);
            roles.should.containEql("student");
            done();
          }); 
        });
      });

      after(function(done) {
        agent
        .delete('/users/users/' + adminId + '/auth')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err)
          res.body.status.should.equal(true, res.body.msg)
          done()
        })
      })
    })
    
    context('Назначение роли student другим пользователем.', function() {
      before('Вход под именем user1.', function(done) {
        agent
        .post('/users/login')
        .send({email: "user1@user1", password: "user1"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается отказ. user2 не получил роль student.', function(done) {
        agent
        .post('/courses/assignRole')
        .send({email: "user2@user2", role: 'student'})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(false, res.body.msg);
          rolesDB.getRolesByEmail("user2@user2", function(err, roles) {
            should.not.exist(err);
            should.not.exist(roles);
            done();
          }); 
        });
      });
    });
    
    context('Назначение роли student самим пользователем.', function() {
      before('Вход под именем user1.', function(done) {
        agent
        .post('/users/login')
        .send({email: "user1@user1", password: "1234"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается успех. user1 получил роль student.', function(done) {
        agent
        .post('/courses/assignRole')
        .send({email: "user1@user1", role: 'student'})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);
          rolesDB.getRolesByEmail("user1@user1", function(err, roles) {
            should.not.exist(err);
            roles.should.containEql("student");
            done();
          }); 
        });
      });
    });
    
    context('Назначение роли без входа в систему.', function() {
      it('Возвращается отказ. user1 не получил роль student.', function(done) {
        agent
          .post('/courses/assignRole')
          .send({email: "user1@user1", role: 'student'})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            res.body.status.should.equal(true, res.body.msg);
            rolesDB.getRolesByEmail("user1@user1", function(err, roles) {
              should.not.exist(err);
              roles.should.containEql("student");
              done();
            }); 
          });
      });
    });
    
    afterEach('Очистка всех ролей после теста.', function(done) {
      rolesDB.clearRoles(function(err) {
        should.not.exist(err);
        done();
      });      
    })
  })

  after('Очистка пользователей', function(done) {
    usersDB.clearUsers(function(err) {
      should.not.exist(err);
      done();
    })
  })
})
