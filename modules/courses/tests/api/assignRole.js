"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const should = require('should')
const supertest = require('supertest')

const coursesDB = require('../../db/courses')
const rolesDB = require('../../db/roles')
const usersDB = require('../../../users/db')

describe('/courses/assignRole', function() {
  /** @type {supertest.SuperTest<supertest.Test>} */
  let agent
  /** @type {express.Express} */
  let app

  before(function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    return mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true})
      .then(client => {
        return client.db(dbName)
      })
      .then(db => {
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

  describe('Назначение роли (assignRole).', function() {
    let adminId
    let userId1
    let userId2

    before('Добавление необходимых пользователей в БД.', function() {
      return usersDB.registerUser({
        email: "admin@admin",
        password: "admin",
        isAdministrator: true,
        registeredBy: "admin@admin"
      })
      .then(admin => {
        adminId = admin._id

        return usersDB.registerUser({
          email: "user1@user1",
          password: "user1",
          isAdministrator: false,
          registeredBy: "admin@admin"
        })
      })
      .then(user1 => {
        userId1 = user1._id

        return usersDB.registerUser({
          email: "user2@user2",
          password: "user2",
          isAdministrator: false,
          registeredBy: "admin@admin"
        })
      })
      .then(user2 => {
        userId2 = user2._id
      })
    })      
    
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

      after(function() {
        return agent
          .delete('/users/users/' + userId1 + '/auth')
          .set('Accept', 'application/json')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)
          })
      })
    });
    
    context('Назначение роли без входа в систему.', function() {
      it('Возвращается отказ. user1 не получил роль student.', function(done) {
        agent
          .post('/courses/assignRole')
          .send({email: "user1@user1", role: 'student'})
          .set('Accept', 'application/json')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);

            res.body.status.should.equal(false, res.body.msg);
            
            rolesDB.getRolesByEmail("user1@user1", function(err, roles) {
              should.not.exist(err)
              if (!!roles) {
                roles.should.not.containEql("student");
              }
              
              done();
            });
          });
      });
    });
    
    afterEach('Очистка всех ролей после теста.', function() {
      return rolesDB.clearRoles()
    })
  })

  after('Очистка пользователей', function() {
    return usersDB.clearUsers()
  })
})
