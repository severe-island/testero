var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();
var rolesDB = require('../db/roles');
var usersDB = require('../../users/db');
var should = require('should');

describe('Модуль courses.', function() {
  describe('Получение списка ролей по email (getRolesByEmail).', function() {
    before('Добавление тестового пользователя в БД.', function(done) {
      usersDB.registerUser({
        email: "admin@admin",
        password: "1234",
        isAdministrator: true,
        registeredBy: "admin@admin"
      }, function(err, newUser) {
        should.not.exist(err);
        done()
      });
    });       
    
    context('Пользователь не имеет ролей.', function() {
      it('Получено null', function(done) {
        request
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
        request
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
  });
});