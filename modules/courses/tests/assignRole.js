 
 var app = require('../../../app');
 var request = require('supertest')(app);
 var superagent = require('superagent');
 var agent = superagent.agent();
 var rolesDB = require('../db/roles');
 
 describe('Модуль courses.', function() {
   describe('Назначение роли (assignRole).', function() {
     context('Назачение teacher администратором.', function() {
       before(function(done) {
         request
         .post('/users/addAdmin')
         .send({
           email: "admin@admin",
           password: "admin",
           passwordDuplicate: "admin"
          })
         .set('X-Requested-With', 'XMLHttpRequest')
         .expect('Content-Type', /application\/json/)
         .expect(200)
         .end(function (err, res) {
           if (err) {
             throw err;
           }
           
           res.body.status.should.equal(true, res.body.msg);
           
           agent.saveCookies(res);
           
           done();
         });
       });
       
       it('Возвращается успех. Администратор имеет роль teacher.', function(done) {
         var req = request.post('/courses/assignRole');
         agent.attachCookies(req);
         req
         .send({email: "admin@admin", role: 'teacher'})
         .set('X-Requested-With', 'XMLHttpRequest')
         .expect('Content-Type', /application\/json/)
         .expect(200)
         .end(function (err, res) {
           if (err) {
             throw err;
           }
           agent.saveCookies(res);
           res.body.status.should.equal(true, res.body.msg);
           
           req = request.post('/courses/getRolesByEmail');
           agent.attachCookies(req);
           req
           .send({email: "admin@admin"})
           .set('X-Requested-With', 'XMLHttpRequest')
           .expect('Content-Type', /application\/json/)
           .expect(200)
           .end(function (err, res) {
             if (err) {
               throw err;
             }
             agent.saveCookies(res);
             res.body.status.should.equal(true, res.body.msg);
             res.body.roles.should.containEql('teacher');
             done();
           });
         });
       });
       
       after(function(done) {
         var req = request.post('/users/clearUsers');
         agent.attachCookies(req);
         req
         .send({email: "user1@testero"})
         .set('X-Requested-With', 'XMLHttpRequest')
         .expect('Content-Type', /application\/json/)
         .expect(200)
         .end(function (err, res) {
           if (err) {
             throw err;
           }
           
           res.body.status.should.equal(true);
           
           done();
         });
         rolesDB.clearRoles(function(err) {
            should.not.equal(err, null);
         });
       });
     });
   });
 });
 