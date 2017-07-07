const app = require('../../../app');
const request = require('supertest')(app);
const supertest = require('supertest')
const agent = supertest.agent(app)
const superagent = require('superagent');
const cookieParser = require('cookie-parser')

var usersDB = require('../db/index');

app.use(cookieParser())

describe('Модуль users', function() {
  describe('Очистка коллекции пользователей (DELETE /users)', function() {
    var admin1 = {
      email: "admin1@testero",
      password: "admin1",
      passwordDuplicate: "admin1",
      isAdministrator: true
    };
    var user1 = {
      email: "user1@testero",
      password: "user1",
      passwordDuplicate: "user1"
    };
    before(function(done) {
      usersDB.clearUsers(function() {
        usersDB.registerUser(admin1, function(err, user) {
          admin1._id = user._id;
          usersDB.registerUser(user1, function(err, user) {
            user1._id = user._id;
            done();
          });
        });
      });
    });
    
    context('Попытка очистки не авторизованным пользователем', function() {
      it('Возвращается отказ', function(done) {
        agent
          .delete('/users/users')
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
    
    context('Попытка очистки не администратором', function() {
      before(function(done) {
        agent
          .post('/users/users/' + user1._id + '/auth')
          .send(user1)
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
      
      it('Возвращается отказ. Количество пользователей не изменилось.', function(done) {
        agent
          .delete('/users/users')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(false, res.body.msg);
            
            agent
              .get('/users/users')
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .end(function(err, res) {
                if (err) {
                  throw err;
                }

                res.body.status.should.equal(true, res.body.msg);
                res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(2);

                done();
            });
          });
      });
    });
    
    context('Очистка администратором', function() {
      before(function(done) {
        agent
          .delete('/users/users/' + user1._id + '/auth')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            res.body.status.should.equal(true, res.body.msg);
            
            agent
              .post('/users/users/' + admin1._id + '/auth')
              .set('X-Requested-With', 'XMLHttpRequest')
              .send(admin1)
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
      
      it('Возвращается успех. В коллекции пользователей нуль', function(done) {
        agent
          .delete('/users/users')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            
            res.body.status.should.equal(true, res.body.msg);
            
            agent
              .get('/users/users')
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .end(function(err, res) {
                if (err) {
                  throw err;
                }

                res.body.status.should.equal(true, res.body.msg);
                res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(0);

                done();
            });
          });
      });
    });
    
    after(function(done) {
      usersDB.clearUsers(function() {
        done();
      });
    });
  });
});
