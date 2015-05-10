var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();
var rolesDB = require('../db/roles');
var usersDB = require('../../users/db');
var should = require('should');

describe('Модуль courses.', function() {
  describe('Назначение роли (assignRole).', function() {
    before('Добавление необходимых пользователей в БД.', function(done) {
      usersDB.registerUser({
        email: "admin@admin",
        password: "1234",
        isAdministrator: true,
        registeredBy: "admin@admin"
      }, function(err, newUser) {
        should.not.exist(err);
        usersDB.registerUser({
          email: "user1@user1",
          password: "1234",
          isAdministrator: false,
          registeredBy: "admin@admin"
        }, function(err, newUser) { 
          should.not.exist(err);
          usersDB.registerUser({
            email: "user2@user2",
            password: "1234",
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
        request
        .post('/users/login')
        .send({email: "admin@admin", password: "1234"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          agent.saveCookies(res);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается успех. user1 имеет роль teacher.', function(done) {
        var req = request.post('/courses/assignRole');
        agent.attachCookies(req);
        req
        .send({email: "user1@user1", role: 'teacher'})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.status.should.equal(true, res.body.msg);  
          rolesDB.getRolesByEmail("user1@user1", function(err, roles) {
            should.not.exist(err);
            roles.should.containEql('teacher');
            done();
          });
        });
      });
      
      after('Очистка всех ролей после теста.', function(done) {
        rolesDB.clearRoles(function(err) {
          should.not.exist(err);
          done();
        });      
      });
    });
    
    context('Назначение роли teacher другим teacher.', function() {
      before('Назначение на user1 роли teacher. Вход под именем user1.', function(done) {
        rolesDB.assignRole("user1@user1", "teacher", function(err) {
          should.not.exist(err);
          request
          .post('/users/login')
          .send({email: "user1@user1", password: "1234"})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            agent.saveCookies(res);
            res.body.status.should.equal(true, res.body.msg);
            done(); 
          });
        });
      });
      
      it('Возвращается успех. user2 имеет роль teacher.', function(done) {
        var req = request.post('/courses/assignRole');
        agent.attachCookies(req);
        req
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
      
      after('Очистка всех ролей после теста.', function(done) {
        rolesDB.clearRoles(function(err) {
          should.not.exist(err);
          done();
        });  
      });
    });
    
    context('Назначение роли teacher пользователем без ролей.', function() {
      before('Вход под именем user1.', function(done) {
        request
        .post('/users/login')
        .send({email: "user1@user1", password: "1234"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          agent.saveCookies(res);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается отказ. user2 не получает роль teacher.', function(done) {
        var req = request.post('/courses/assignRole');
        agent.attachCookies(req);
        req
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
      
      after('Очистка всех ролей после теста.', function(done) {
        rolesDB.clearRoles(function(err) {
          should.not.exist(err);
          done();
        });  
      });
    });
    
    context('Назначение роли teacher пользователем с ролью student.', function() {
      before('Назначение user1 роли student. Вход под именем user1.', function(done) {
        rolesDB.assignRole("user1@user1", "student", function(err) {
          should.not.exist(err);
          request
          .post('/users/login')
          .send({email: "user1@user1", password: "1234"})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            should.not.exist(err);
            agent.saveCookies(res);
            res.body.status.should.equal(true, res.body.msg);
            done(); 
          });
        });
      });
      
      it('Возвращается отказ. user2 не получает роль teacher.', function(done) {
        var req = request.post('/courses/assignRole');
        agent.attachCookies(req);
        req
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
      
      after('Очистка всех ролей после теста.', function(done) {
        rolesDB.clearRoles(function(err) {
          should.not.exist(err);
          done();
        });  
      });
    });
    
    context('Назначение роли student администратором.', function() {
      before('Вход под именем администратора.', function(done) {
        request
        .post('/users/login')
        .send({email: "admin@admin", password: "1234"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          agent.saveCookies(res);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается успех. user2 получил роль student.', function(done) {
        var req = request.post('/courses/assignRole');
        agent.attachCookies(req);
        req
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
      
      after('Очистка всех ролей после теста.', function(done) {
        rolesDB.clearRoles(function(err) {
          should.not.exist(err);
          done();
        });  
      });
    });
    
    context('Назначение роли student другим пользователем.', function() {
      before('Вход под именем user1.', function(done) {
        request
        .post('/users/login')
        .send({email: "user1@user1", password: "1234"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          agent.saveCookies(res);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается отказ. user2 не получил роль student.', function(done) {
        var req = request.post('/courses/assignRole');
        agent.attachCookies(req);
        req
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
      
      after('Очистка всех ролей после теста.', function(done) {
        rolesDB.clearRoles(function(err) {
          should.not.exist(err);
          done();
        });  
      });
    });
    
    context('Назначение роли student самим пользователем.', function() {
      before('Вход под именем user1.', function(done) {
        request
        .post('/users/login')
        .send({email: "user1@user1", password: "1234"})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          agent.saveCookies(res);
          res.body.status.should.equal(true, res.body.msg);
          done(); 
        });
      });
      
      it('Возвращается успех. user1 получил роль student.', function(done) {
        var req = request.post('/courses/assignRole');
        agent.attachCookies(req);
        req
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
      
      after('Очистка всех ролей после теста.', function(done) {
        rolesDB.clearRoles(function(err) {
          should.not.exist(err);
          done();
        });  
      });
    });
    
    context('Назначение роли без входа в систему.', function() {
      it('Возвращается отказ. user1 не получил роль student.', function(done) {
        var req = request.post('/courses/assignRole');
        agent.attachCookies(req);
        req
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
      
      after('Очистка всех ролей после теста.', function(done) {
        rolesDB.clearRoles(function(err) {
          should.not.exist(err);
          done();
        });  
      });
    });
    
    after('Очистка пользователей', function(done) {
      usersDB.clearUsers(function(err) {
        should.not.exist(err);
        done();
      });
    });
  });
});
